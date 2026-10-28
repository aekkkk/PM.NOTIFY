"use client";

// หน้าแดชบอร์ด: ค่าฝุ่นปัจจุบัน การ์ดค่าอื่น ๆ แบนเนอร์เตือน และปุ่มเปิดการแจ้งเตือน
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Battery, BatteryLow, Bell, BellOff, BellRing, CloudOff, Droplets, Factory, Gauge, Thermometer, TriangleAlert, Wind, WifiOff } from "lucide-react";
import { useData } from "@/components/DataProvider";
import { StatCard } from "@/components/StatCard";
import { primaryButton } from "@/components/buttons";
import { CountBadge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LeadGoal } from "@/components/ui/LeadGoal";
import { PM25_DANGER, PM25_THRESHOLD, fmt1, fmtDate, fmtTime, getAirLevel } from "@/lib/airQuality";
import { downloadCsv } from "@/lib/analysis";

export function Dashboard() {
  const router = useRouter();
  const data = useData();
  const { latest, history, level, offline, noData, loading } = data;

  if (loading) {
    return <p className="py-24 text-center text-neutral-500 home-dark:text-neutral-400">กำลังเชื่อมต่อกับเครื่อง PM.Notify…</p>;
  }

  // ยังไม่เคยได้รับข้อมูล หรือเครื่อง offline เกิน 10 นาที → แสดง EmptyState
  if (noData || offline || !latest || !level) {
    return (
      <div className="flex flex-col items-center gap-6">
        <EmptyState
          icon={offline ? <WifiOff size={56} strokeWidth={1.6} className="text-[#3979e8] home-dark:text-sky-400" /> : <CloudOff size={56} strokeWidth={1.6} className="text-[#3979e8] home-dark:text-sky-400" />}
          title="ยังไม่ได้รับข้อมูลจากเครื่อง"
          description={
            offline && latest
              ? `ไม่มีข้อมูลใหม่เกิน 10 นาที (ค่าล่าสุดเมื่อ ${fmtDate(new Date(latest.timestamp))} ${fmtTime(new Date(latest.timestamp))}) ตรวจว่าเครื่องเชื่อมต่อ Wi-Fi ได้ และแบตเตอรี่ยังมีไฟ`
              : "ตรวจว่าเครื่องเปิดอยู่ เชื่อมต่อ Wi-Fi ได้ และแบตเตอรี่ยังมีไฟ จากนั้นรอสักครู่ให้เครื่องส่งข้อมูลรอบถัดไป"
          }
          actionLabel="ลองเชื่อมต่ออีกครั้ง"
          onAction={data.reconnect}
        />
        {data.error && <p className="text-center text-[13px] text-[#d92d35]">{data.error}</p>}
      </div>
    );
  }

  const over = latest.pm25 > PM25_THRESHOLD;
  const danger = latest.pm25 > PM25_DANGER;
  const avgLevel = data.avg24 !== null ? getAirLevel(data.avg24) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* แบนเนอร์เตือนเมื่อ PM2.5 เกินเกณฑ์ (ส้ม = เกิน 37.5, แดง = เกิน 75) */}
      {over && (
        <div
          role="alert"
          style={{ "--tone": danger ? "#e5484d" : "#ff9900" } as CSSProperties}
          className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--tone)_35%,transparent)] bg-[color-mix(in_srgb,var(--tone)_12%,var(--background))] p-4 text-[color-mix(in_srgb,var(--tone)_88%,var(--foreground))] home-dark:text-[color-mix(in_srgb,var(--tone)_70%,var(--foreground))]"
        >
          <TriangleAlert size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{danger ? "ฝุ่น PM2.5 สูงมาก มีผลกระทบต่อสุขภาพ" : "ฝุ่น PM2.5 เกินเกณฑ์มาตรฐาน"} ({fmt1(latest.pm25)} µg/m³)</p>
            <p className="mt-0.5 text-[14px]">{level.advice}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* การ์ดหลัก: เกจ PM2.5 */}
        <div className="flex flex-col gap-4">
          <LeadGoal
            className="w-full"
            current={latest.pm25}
            target={PM25_THRESHOLD}
            color={level.color}
            title="PM2.5 ตอนนี้"
            summaryLabel="µg/m³"
            periodLabel="ของเกณฑ์มาตรฐาน"
            onViewReport={() => router.push("/charts")}
            onExportData={() => downloadCsv(history)}
          />
          <section aria-label="ระดับคุณภาพอากาศ" className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs home-dark:border-neutral-800 home-dark:bg-neutral-900">
            <StatusBadge status={level.badge}>{level.label}</StatusBadge>
            <p className="mt-3 text-[14px] leading-relaxed text-neutral-600 home-dark:text-neutral-300">{level.advice}</p>
          </section>
        </div>

        {/* การ์ดย่อย */}
        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard title="PM1.0" value={latest.pm1} unit="µg/m³" icon={<Wind />} accent="#a5a3ff" />
          <StatCard title="PM10" value={latest.pm10} unit="µg/m³" icon={<Factory />} accent="#a5a3ff" />
          <StatCard
            title="PM2.5 เฉลี่ย 24 ชม."
            value={data.avg24 !== null ? Math.round(data.avg24 * 10) / 10 : null}
            unit="µg/m³"
            icon={<Gauge />}
            accent={avgLevel?.color}
            footer={data.avg24 !== null && (data.avg24 > PM25_THRESHOLD ? "เกินมาตรฐาน" : "ไม่เกินมาตรฐาน")}
          />
          <StatCard title="อุณหภูมิ" value={latest.temperature} unit="°C" icon={<Thermometer />} accent="#ff9900" />
          <StatCard title="ความชื้น" value={latest.humidity} unit="%RH" icon={<Droplets />} accent="#00cceb" footer={latest.humidity > 85 ? "ความชื้นสูง ค่าฝุ่นอาจสูงเกินจริง" : undefined} />
          <StatCard
            title="แบตเตอรี่"
            value={latest.battery}
            unit="%"
            digits={0}
            icon={latest.battery < 30 ? <BatteryLow /> : <Battery />}
            accent={latest.battery < 30 ? "#e5484d" : "#71d64c"}
            footer={latest.battery < 30 ? "ต่ำกว่า 30% เครื่องจะเข้า Deep Sleep" : "ชาร์จด้วยโซลาร์เซลล์"}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-100 p-4 sm:flex-row sm:items-center sm:justify-between home-dark:border-neutral-800 home-dark:bg-neutral-800">
        <p className="flex items-center gap-2 text-[14px]">
          PM2.5 เกินเกณฑ์วันนี้
          <CountBadge count={data.todayCount} variant={data.todayCount ? "emphasis" : "default"} label={`วันนี้ PM2.5 เกินเกณฑ์ ${data.todayCount} ครั้ง`} />
          ครั้ง
        </p>
        <BrowserNotificationButton />
      </div>

    </div>
  );
}

// ปุ่มขออนุญาตแจ้งเตือนบนเบราว์เซอร์ (Notification API)
function BrowserNotificationButton() {
  const { browserPermission, enableBrowserNotifications } = useData();
  if (browserPermission === "unsupported") {
    return <p className="text-[13px] text-neutral-500">เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน</p>;
  }
  if (browserPermission === "granted") {
    return (
      <p className="flex items-center gap-2 text-[14px] text-neutral-600 home-dark:text-neutral-300">
        <BellRing size={18} aria-hidden="true" className="text-sky-500" />
        เปิดการแจ้งเตือนบนเบราว์เซอร์แล้ว (ทำงานเมื่อเปิดหน้าเว็บค้างไว้)
      </p>
    );
  }
  if (browserPermission === "denied") {
    return (
      <p className="flex items-center gap-2 text-[13px] text-neutral-500 home-dark:text-neutral-400">
        <BellOff size={18} aria-hidden="true" />
        การแจ้งเตือนถูกบล็อก เปิดได้ที่ไอคอนแม่กุญแจข้างแถบที่อยู่เว็บ
      </p>
    );
  }
  return (
    <button type="button" onClick={() => void enableBrowserNotifications()} className={primaryButton}>
      <Bell size={16} aria-hidden="true" />
      เปิดการแจ้งเตือนบนเบราว์เซอร์
    </button>
  );
}
