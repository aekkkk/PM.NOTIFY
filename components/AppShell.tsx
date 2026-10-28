"use client";

// โครงหน้าเว็บที่ใช้ร่วมกันทุกหน้า: header (ชื่อ, สถานะเครื่อง, กระดิ่ง, ปุ่มธีม) + เมนูนำทาง
import type { ReactNode } from "react";
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
      <span className="truncate text-[13px] text-neutral-500 home-dark:text-neutral-400">
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
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-background/85 backdrop-blur-md home-dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <span className="text-[19px] font-semibold tracking-tight">PM.Notify</span>
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
        </div>
        <nav aria-label="เมนูหลัก" className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3">
          <SegmentedControl
            label="เลือกหน้า"
            value={current}
            options={pages}
            onChange={(path) => router.push(path)}
            className="w-max min-w-full sm:min-w-0"
            itemClassName="flex-1 px-2.5 text-[13px] sm:flex-none sm:px-4 sm:text-[14px]"
          />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>

      <footer className="mx-auto w-full max-w-6xl px-4 pt-2 pb-10 text-[12px] text-neutral-500 home-dark:text-neutral-400">
        <p>PM.Notify เป็นเครื่องต้นแบบเพื่อการเรียนรู้ ไม่ใช่เครื่องมือวัดมาตรฐานทางการ · โครงงาน IoT ม.2 ปีการศึกษา 2569</p>
        {/* สัญญาอนุญาต Creative Commons: นำไปใช้ต่อได้ ถ้าให้เครดิต ไม่ใช้หาเงิน และแบ่งปันต่อด้วยสัญญาเดียวกัน */}
        <p className="mt-2 flex flex-wrap items-center gap-2">
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.th" target="_blank" rel="license noopener noreferrer" aria-label="สัญญาอนุญาต Creative Commons แสดงที่มา-ไม่ใช้เพื่อการค้า-อนุญาตแบบเดียวกัน 4.0" className="rounded-sm opacity-80 transition-opacity hover:opacity-100">
            <CcBadge />
          </a>
          <span>CC BY-NC-SA 4.0</span>
        </p>
      </footer>

      {/* ToastStack ต้นฉบับใช้ position: absolute จึงวางในกล่อง fixed ให้ลอยอยู่ล่างจอทุกหน้า */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-44">
        <ToastStack />
      </div>
    </>
  );
}
