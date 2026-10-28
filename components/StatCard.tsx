"use client";

// การ์ดค่าย่อย ใช้โครงเดียวกับ LeadGoal: กรอบนอกสีเทา + การ์ดในสีขาว มุมโค้ง rounded-2xl
import { useId, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

export type StatCardProps = {
  title: string;
  value: number | null;
  unit: string;
  digits?: number; // จำนวนทศนิยม
  icon?: ReactNode;
  accent?: string; // สีไอคอน
  footer?: ReactNode;
  className?: string;
};

export function StatCard({ title, value, unit, digits = 1, icon, accent = "#55bbfa", footer, className }: StatCardProps) {
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <section aria-labelledby={`${id}-title`} className={cn("flex flex-col rounded-2xl border border-neutral-200 bg-neutral-100 text-neutral-800 home-dark:border-neutral-800 home-dark:bg-neutral-800 home-dark:text-neutral-100", className)}>
      <header className="flex h-10 items-center gap-2 px-4">
        <h3 id={`${id}-title`} className="min-w-0 truncate text-[14px] max-sm:text-[13px] font-normal text-neutral-500 home-dark:text-neutral-400">{title}</h3>
        {icon && (
          <span aria-hidden="true" className="ml-auto grid size-6 place-items-center rounded-md [&>svg]:size-4" style={{ color: `color-mix(in srgb, ${accent} 88%, var(--foreground))` }}>
            {icon}
          </span>
        )}
      </header>
      <div className="-mx-px -mb-px flex flex-1 flex-col justify-center rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-xs home-dark:border-neutral-800 home-dark:bg-neutral-900">
        <p className="flex items-baseline gap-1.5">
          <span className="text-[28px] leading-none font-semibold tracking-tight tabular-nums">
            {value === null ? "–" : <NumberFlow value={value} animated={!reduced} locales="th-TH" format={{ minimumFractionDigits: digits, maximumFractionDigits: digits }} />}
          </span>
          <span className="text-[14px] text-neutral-500 home-dark:text-neutral-400">{unit}</span>
        </p>
        {footer && <div className="mt-2 text-[12px] text-neutral-500 home-dark:text-neutral-400">{footer}</div>}
      </div>
    </section>
  );
}
