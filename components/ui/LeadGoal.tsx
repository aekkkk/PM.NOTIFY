// components/ui/LeadGoal.tsx
// Also requires: @/lib/utils
"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
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
  // แก้จากต้นฉบับ InitStudio: ช่องใส่เนื้อหาใต้เกจ (ใช้ใส่ป้ายระดับและคำแนะนำ)
  footer?: ReactNode;
  className?: string;
};

const arc = "M 16 100 A 84 84 0 0 1 184 100";
const menuItem = "flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-3 text-[13px] outline-none data-highlighted:bg-brand-soft data-highlighted:text-brand";

// แก้จากต้นฉบับ InitStudio: ปัดเป็นทศนิยม 1 ตำแหน่งแทน Math.floor (ค่าฝุ่นมีทศนิยม เช่น 28.6)
const round1 = (value: number) => Math.round(value * 10) / 10;
const th1 = (value: number) => value.toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function LeadGoal({ current = 2257, target = 3000, title = "Lead Goal", summaryLabel = "Summarize", periodLabel = "monthly goal", color = "#b5461f", onViewReport, onExportData, footer, className }: LeadGoalProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const amount = Number.isFinite(current) ? Math.max(0, round1(current)) : 0;
  const goal = Number.isFinite(target) ? Math.max(0, round1(target)) : 0;
  const percent = goal > 0 ? Math.round((amount / goal) * 100) : 0;
  // เส้นโค้งเต็มได้มากสุด 100% แต่ข้อความด้านล่างแสดงเกิน 100% ได้ (เช่น 130%)
  const filled = Math.min(100, percent);
  const rest = filled === 0 ? 100 : Math.max(0, 100 - filled - 7);

  return (
    // แก้จากต้นฉบับ InitStudio: การ์ดชั้นเดียวเรียบ ๆ แทนกรอบเทาซ้อนกรอบขาว (สีบอกระดับอยู่ที่เส้นเกจ)
    <section
      aria-labelledby={`${id}-title`}
      style={{ "--tone": color } as CSSProperties}
      className={cn("card flex w-[320px] max-w-full flex-col text-foreground", className)}
    >
      <header className="flex h-12 items-center gap-2 pr-2.5 pl-4">
        <h3 id={`${id}-title`} className="text-[13px] font-medium text-muted">{title}</h3>
        <Menu.Root modal={false}>
          {/* แก้จากต้นฉบับ InitStudio: aria-label และเมนูเป็นภาษาไทย */}
          <Menu.Trigger aria-label={`ตัวเลือกของ ${title}`} className="ml-auto grid size-8 cursor-pointer place-items-center rounded-lg text-muted outline-none hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"><MoreHorizontal size={16} aria-hidden="true" /></Menu.Trigger>
          <Menu.Portal><Menu.Positioner align="end" sideOffset={6} className="z-50"><Menu.Popup className="card min-w-48 p-1.5 text-foreground outline-none">
            <Menu.Item onClick={onViewReport} className={menuItem}><ChartLine size={15} aria-hidden="true" />ดูกราฟย้อนหลัง</Menu.Item>
            <Menu.Item onClick={onExportData} className={menuItem}><Download size={15} aria-hidden="true" />ดาวน์โหลดข้อมูล (CSV)</Menu.Item>
          </Menu.Popup></Menu.Positioner></Menu.Portal>
        </Menu.Root>
      </header>

      <div className="relative flex min-h-[224px] flex-1 flex-col items-center justify-center px-5 pt-2 pb-5">
        <div role="img" aria-label={`${title} ${th1(amount)} ${summaryLabel} ${goal > 0 ? `คิดเป็น ${percent}% ของเกณฑ์ ${th1(goal)}` : "ยังไม่ได้ตั้งเกณฑ์"}`} className="relative w-full max-w-64">
          <svg viewBox="0 0 200 108" className="w-full" aria-hidden="true">
            {rest > 0 && <path d={arc} pathLength={100} fill="none" strokeWidth={14} strokeLinecap="round" className="stroke-foreground/10" strokeDasharray={`${rest} 100`} strokeDashoffset={filled > 0 ? -(filled + 7) : 0} />}
            {/* แก้จากต้นฉบับ InitStudio: stroke ใช้ prop color แทน #5b5ce6 และเปลี่ยนสีแบบนุ่มนวล */}
            {filled > 0 && <motion.path d={arc} pathLength={100} fill="none" strokeWidth={14} strokeLinecap="round" initial={reduced ? false : { strokeDasharray: "0 100", stroke: color }} animate={{ strokeDasharray: `${filled} 100`, stroke: color }} transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }} />}
          </svg>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className="text-[13px] text-muted">{summaryLabel}</span>
            {/* แก้จากต้นฉบับ InitStudio: แสดงทศนิยม 1 ตำแหน่ง */}
            <span className="text-[36px] leading-none font-semibold tracking-tight tabular-nums"><NumberFlow value={amount} animated={!reduced} locales="th-TH" format={{ useGrouping: true, minimumFractionDigits: 1, maximumFractionDigits: 1 }} /></span>
          </div>
        </div>
        <p className="mt-4 text-[14px] text-muted">{goal > 0 ? <><span className="font-semibold text-foreground tabular-nums">{percent}%</span> {periodLabel} <span className="tabular-nums">{th1(goal)}</span></> : "ตั้งเกณฑ์ก่อนเพื่อเปรียบเทียบ"}</p>
      {footer && <div className="mt-4 w-full border-t border-foreground/10 pt-4">{footer}</div>}
      </div>
    </section>
  );
}
