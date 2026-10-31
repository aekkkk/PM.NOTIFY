"use client";

// การ์ดค่าย่อย (แก้จากต้นฉบับ InitStudio: ใช้การ์ดชั้นเดียวเรียบ ๆ แทนกรอบเทาซ้อนกรอบขาว)
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

export function StatCard({ title, value, unit, digits = 1, icon, accent = "#b5461f", footer, className }: StatCardProps) {
  const id = useId();
  const reduced = useReducedMotion();
  return (
    <section
      aria-labelledby={`${id}-title`}
      className={cn("card flex flex-col gap-3 p-4 text-foreground", className)}
    >
      <header className="flex items-center gap-2 text-muted">
        {icon && (
          <span aria-hidden="true" className="grid shrink-0 place-items-center [&>svg]:size-4" style={{ color: `color-mix(in srgb, ${accent} 75%, var(--foreground))` }}>
            {icon}
          </span>
        )}
        <h3 id={`${id}-title`} className="min-w-0 text-[13px] leading-tight font-medium">{title}</h3>
      </header>
      <div>
        <p className="flex items-baseline gap-1.5">
          <span className="text-[30px] leading-none font-semibold tracking-tight tabular-nums">
            {value === null ? "–" : <NumberFlow value={value} animated={!reduced} locales="th-TH" format={{ minimumFractionDigits: digits, maximumFractionDigits: digits }} />}
          </span>
          <span className="text-[13px] text-muted">{unit}</span>
        </p>
        {footer && <div className="mt-2 text-[12px] leading-snug text-muted">{footer}</div>}
      </div>
    </section>
  );
}
