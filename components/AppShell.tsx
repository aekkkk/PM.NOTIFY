"use client";

// โครงหน้าเว็บที่ใช้ร่วมกันทุกหน้า: header (ชื่อ, สถานะเครื่อง, กระดิ่ง, ปุ่มธีม) + เมนูนำทาง
import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertBell } from "@/components/ui/AlertBell";
import { StatusBadge } from "@/components/ui/Badge";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ToastStack } from "@/components/ui/ToastStack";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useData } from "@/components/DataProvider";
import { CcBadge } from "@/components/CcIcons";
import { toTime } from "@/lib/dataService";

const pages = [
  { value: "/", label: "แดชบอร์ด" },
  { value: "/charts", label: "กราฟ" },
  { value: "/history", label: "ประวัติ" },
  { value: "/knowledge", label: "ความรู้" },
  { value: "/about", label: "เกี่ยวกับ" },
] as const;
type PagePath = (typeof pages)[number]["value"];

// ข้อความ "อัปเดตล่าสุด x นาทีที่แล้ว"
function updatedText(timestamp: number, now: number) {
  const minutes = Math.floor((now - timestamp) / 60000);
  if (minutes < 1) return "อัปเดตล่าสุดเมื่อสักครู่";
  if (minutes < 60) return `อัปเดตล่าสุด ${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `อัปเดตล่าสุด ${hours} ชั่วโมงที่แล้ว`;
  return `อัปเดตล่าสุด ${Math.floor(hours / 24)} วันที่แล้ว`;
}

// สีโลโก้ตามระดับคุณภาพอากาศล่าสุด (ถ้ายังไม่มีข้อมูลหรือเครื่องออฟไลน์ใช้สีหลักของเว็บ)
// พื้นสีเหลือง/เขียวอ่อนสว่างเกินกว่าจะใช้เส้นขาว จึงใช้เส้นสีหมึกแทน
function useLogoColors() {
  const { level, offline } = useData();
  const live = level && !offline ? level : null;
  return {
    tone: live ? live.color : "#b5461f",
    stroke: live && (live.key === "good" || live.key === "moderate") ? "#1c1b18" : "#ffffff",
  };
}

const logoPath = "M7 13h11a3.5 3.5 0 1 0-3.4-4.3M7 18h15a3.5 3.5 0 1 1-3.4 4.3M7 23h7";

// โลโก้บนหน้าเว็บ: สี่เหลี่ยมมนกับเส้นลม
function LogoMark() {
  const { tone, stroke } = useLogoColors();
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8 shrink-0">
      <rect width="32" height="32" rx="8" fill={tone} style={{ transition: "fill 0.6s" }} />
      <path d={logoPath} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

// ไอคอนแท็บเบราว์เซอร์ (favicon) เปลี่ยนสีตามโลโก้ด้วย
function FaviconSync() {
  const { tone, stroke } = useLogoColors();
  useEffect(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="${tone}"/><path d="${logoPath}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round"/></svg>`;
    const href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    // Chrome ไม่อัปเดตไอคอนเมื่อแก้ href ของ <link> เดิม ต้องถอดของเดิมแล้วใส่ <link> ใหม่
    document.head.querySelectorAll('link[rel~="icon"]').forEach((link) => link.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/svg+xml";
    link.href = href;
    document.head.appendChild(link);
  }, [tone, stroke]);
  return null;
}

function DeviceStatus() {
  const { latest, now, offline, loading } = useData();
  const badge =
    loading ? <StatusBadge status="waiting">กำลังเชื่อมต่อ</StatusBadge>
    : !latest || offline ? <StatusBadge status="offline">ออฟไลน์</StatusBadge>
    : latest.status === "deep_sleep" ? <StatusBadge status="paused">Deep Sleep</StatusBadge>
    : <StatusBadge status="ready">ออนไลน์</StatusBadge>;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {badge}
      <span className="truncate text-[13px] text-muted">
        {latest && now ? updatedText(toTime(latest), now) : loading ? "กำลังรอข้อมูล…" : "ยังไม่ได้รับข้อมูล"}
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications, unread, markRead, soundEnabled, setSoundEnabled } = useData();
  const current = (pages.find((p) => p.value !== "/" && pathname.startsWith(p.value))?.value ?? "/") as PagePath;

  return (
    <>
      <FaviconSync />
      {/* แก้จากต้นฉบับ InitStudio: header แถบเรียบ มีโลโก้ */}
      <header className="sticky top-0 z-30 border-b border-line bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/" aria-label="PM.Notify หน้าแรก" className="flex items-center gap-2.5 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
            <LogoMark />
            <span className="text-[19px] font-bold tracking-tight">PM<span className="text-brand">.</span>Notify</span>
          </Link>
          {/* สถานะเครื่อง: บนมือถือขึ้นบรรทัดใหม่ บนจอใหญ่อยู่ข้างชื่อ */}
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
            <DeviceStatus />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <AlertBell
              count={unread}
              notifications={notifications}
              soundEnabled={soundEnabled}
              onSoundEnabledChange={setSoundEnabled}
              onOpenChange={(open) => open && markRead()}
            />
            <ThemeSwitcher />
          </div>
        <nav aria-label="เมนูหลัก" className="order-last -mx-1 w-full overflow-x-auto px-1 pb-1">
          <SegmentedControl
            label="เลือกหน้า"
            value={current}
            options={pages}
            onChange={(path) => router.push(path)}
            className="w-max min-w-full sm:min-w-0"
            itemClassName="flex-1 px-2.5 text-[13px] sm:flex-none sm:px-4 sm:text-[14px]"
          />
        </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">{children}</main>

      <footer className="mt-6 border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-[12px] text-muted">
          <div>
            <p className="text-[14px] font-semibold text-foreground">PM.Notify</p>
            <p className="mt-1 leading-relaxed">PM.Notify เป็นเครื่องต้นแบบเพื่อการเรียนรู้ ไม่ใช่เครื่องมือวัดมาตรฐานทางการ · โครงงาน IoT ม.2 ปีการศึกษา 2569</p>
            {/* สัญญาอนุญาต Creative Commons: นำไปใช้ต่อได้ ถ้าให้เครดิต ไม่ใช้หาเงิน และแบ่งปันต่อด้วยสัญญาเดียวกัน */}
            <p className="mt-3 flex flex-wrap items-center gap-2">
              <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.th" target="_blank" rel="license noopener noreferrer" aria-label="สัญญาอนุญาต Creative Commons แสดงที่มา-ไม่ใช้เพื่อการค้า-อนุญาตแบบเดียวกัน 4.0" className="rounded-sm opacity-80 transition-opacity hover:opacity-100">
                <CcBadge />
              </a>
              <span>CC BY-NC-SA 4.0</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ToastStack ต้นฉบับใช้ position: absolute จึงวางในกล่อง fixed ให้ลอยอยู่ล่างจอทุกหน้า */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-44">
        <ToastStack />
      </div>
    </>
  );
}
