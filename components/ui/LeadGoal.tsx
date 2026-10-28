// components/ui/LeadGoal.tsx
// Also requires: @/lib/utils
"use client";

import { useId } from "react";
import { Menu } from "@base-ui/react/menu";
import { motion, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";
// แก้จากต้นฉบับ InitStudio: เปลี่ยนไอคอนเมนูแรกเป็นรูปกราฟ (ChartLine) ให้ตรงกับ "ดูกราฟย้อนหลัง"
import { ChartLine, Download, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type LeadGoalProps = {
  current?: number;
  target?: number;
  title?: string;
  summaryLabel?: string;
  periodLabel?: string;
  // แก้จากต้นฉบับ InitStudio: เพิ่ม prop color ให้สีเส้นโค้งเปลี่ยนตามระดับคุณภาพอากาศ
  color?: string;
  onViewReport?: () => void;
  onExportData?: () => void;
  className?: string;
};

const arc = "M 16 100 A 84 84 0 0 1 184 100";
const menuItem = "flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-[13px] outline-none data-highlighted:bg-neutral-100 home-dark:data-highlighted:bg-neutral-800";

// แก้จากต้นฉบับ InitStudio: ปัดเป็นทศนิยม 1 ตำแหน่งแทน Math.floor (ค่าฝุ่นมีทศนิยม เช่น 28.6)
const round1 = (value: number) => Math.round(value * 10) / 10;
const th1 = (value: number) => value.toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function LeadGoal({ current = 2257, target = 3000, title = "Lead Goal", summaryLabel = "Summarize", periodLabel = "monthly goal", color = "#5b5ce6", onViewReport, onExportData, className }: LeadGoalProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const amount = Number.isFinite(current) ? Math.max(0, round1(current)) : 0;
  const goal = Number.isFinite(target) ? Math.max(0, round1(target)) : 0;
  const percent = goal > 0 ? Math.round((amount / goal) * 100) : 0;
  // เส้นโค้งเต็มได้มากสุด 100% แต่ข้อความด้านล่างแสดงเกิน 100% ได้ (เช่น 130%)
  const filled = Math.min(100, percent);
  const rest = filled === 0 ? 100 : Math.max(0, 100 - filled - 7);

  return (
    <section aria-labelledby={`${id}-title`} className={cn("flex w-[320px] max-w-full flex-col rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-800 home-dark:border-neutral-800 home-dark:bg-neutral-800 home-dark:text-neutral-100", className)}>
      <header className="flex h-10 items-center gap-2 pr-2 pl-4">
        <h3 id={`${id}-title`} className="text-[15px] font-normal text-neutral-500 home-dark:text-neutral-400">{title}</h3>
        <Menu.Root modal={false}>
          {/* แก้จากต้นฉบับ InitStudio: aria-label และเมนูเป็นภาษาไทย */}
          <Menu.Trigger aria-label={`ตัวเลือกของ ${title}`} className="ml-auto grid size-7 cursor-pointer place-items-center rounded-md text-neutral-500 outline-none hover:bg-neutral-200 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-sky-500 home-dark:hover:bg-neutral-700 home-dark:hover:text-white"><MoreHorizontal size={16} aria-hidden="true" /></Menu.Trigger>
          <Menu.Portal><Menu.Positioner align="end" sideOffset={6} className="z-50"><Menu.Popup className="min-w-44 rounded-[12px] border border-neutral-200 bg-white p-1.5 text-neutral-800 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_8px_-2px_rgb(0_0_0/0.06),0_12px_24px_-8px_rgb(0_0_0/0.08)] outline-none home-dark:border-neutral-700 home-dark:bg-neutral-900 home-dark:text-neutral-100">
            <Menu.Item onClick={onViewReport} className={menuItem}><ChartLine size={15} aria-hidden="true" />ดูกราฟย้อนหลัง</Menu.Item>
            <Menu.Item onClick={onExportData} className={menuItem}><Download size={15} aria-hidden="true" />ดาวน์โหลดข้อมูล (CSV)</Menu.Item>
          </Menu.Popup></Menu.Positioner></Menu.Portal>
        </Menu.Root>
      </header>

      <div className="-mx-px -mb-px flex min-h-[224px] flex-1 flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs home-dark:border-neutral-800 home-dark:bg-neutral-900">
        {/* แก้จากต้นฉบับ InitStudio: aria-label ภาษาไทย และใช้รูปแบบตัวเลข th-TH */}
        <div role="img" aria-label={`${title} ${th1(amount)} ${summaryLabel} ${goal > 0 ? `คิดเป็น ${percent}% ของเกณฑ์ ${th1(goal)}` : "ยังไม่ได้ตั้งเกณฑ์"}`} className="relative w-full max-w-64">
          <svg viewBox="0 0 200 108" className="w-full" aria-hidden="true">
            {rest > 0 && <path d={arc} pathLength={100} fill="none" strokeWidth={12} strokeLinecap="round" className="stroke-[#f0f0f0] home-dark:stroke-neutral-800" strokeDasharray={`${rest} 100`} strokeDashoffset={filled > 0 ? -(filled + 7) : 0} />}
            {/* แก้จากต้นฉบับ InitStudio: stroke ใช้ prop color แทน #5b5ce6 และเปลี่ยนสีแบบนุ่มนวล */}
            {filled > 0 && <motion.path d={arc} pathLength={100} fill="none" strokeWidth={12} strokeLinecap="round" initial={reduced ? false : { strokeDasharray: "0 100", stroke: color }} animate={{ strokeDasharray: `${filled} 100`, stroke: color }} transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} />}
          </svg>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className="text-[14px] text-neutral-500 home-dark:text-neutral-400">{summaryLabel}</span>
            {/* แก้จากต้นฉบับ InitStudio: แสดงทศนิยม 1 ตำแหน่ง */}
            <span className="text-[32px] leading-none font-semibold tracking-tight tabular-nums"><NumberFlow value={amount} animated={!reduced} locales="th-TH" format={{ useGrouping: true, minimumFractionDigits: 1, maximumFractionDigits: 1 }} /></span>
          </div>
        </div>
        <p className="mt-4 text-[14px] text-neutral-500 home-dark:text-neutral-400">{goal > 0 ? <><span className="text-neutral-800 tabular-nums home-dark:text-neutral-100">{percent}%</span> {periodLabel} <span className="tabular-nums">{th1(goal)}</span></> : "ตั้งเกณฑ์ก่อนเพื่อเปรียบเทียบ"}</p>
      </div>
    </section>
  );
}
