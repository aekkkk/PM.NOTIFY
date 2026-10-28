// components/ui/SegmentedControl.tsx
// ไฟล์ใหม่: สร้างจากสไตล์ track / item / lifted และแถบเลื่อน motion.span ของ RowsPerPage (Pagination ของ InitStudio)
// ต่างกันตรงที่รับตัวเลือกเป็นข้อความ ใช้เลือกช่วงเวลากราฟ และใช้เป็นเมนูนำทางบนมือถือ
"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { item, lifted, track } from "@/components/ui/Pagination";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

export type SegmentedControlProps<T extends string> = {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string; // aria-label ของกลุ่มปุ่ม (ภาษาไทย)
  className?: string;
  itemClassName?: string;
};

export function SegmentedControl<T extends string>({ value, options, onChange, label, className, itemClassName }: SegmentedControlProps<T>) {
  const reduced = useReducedMotion();
  const indicatorId = useId();
  // ถ้าผู้ใช้ตั้งค่าลดการเคลื่อนไหว แถบจะย้ายทันทีโดยไม่เลื่อน
  const spring = reduced ? { duration: 0 } : ({ type: "spring", duration: 0.38, bounce: 0 } as const);

  return (
    <div role="group" aria-label={label} className={cn(track, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={cn(item, "min-w-10 gap-1.5 px-3 hover:bg-foreground/5 aria-pressed:font-semibold aria-pressed:hover:bg-transparent", itemClassName)}
        >
          {option.value === value && <motion.span layoutId={indicatorId} transition={spring} className={cn("absolute inset-0 rounded-[11px]", lifted)} />}
          {option.icon && <span aria-hidden="true" className="relative grid place-items-center [&>svg]:size-4">{option.icon}</span>}
          <span className="relative whitespace-nowrap">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
