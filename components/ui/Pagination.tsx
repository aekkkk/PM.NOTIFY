// components/ui/Pagination.tsx
// Also requires: @/lib/utils
"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

export function paginationRange(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 6) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, "end-ellipsis", totalPages];
  if (page >= totalPages - 2) return [1, "start-ellipsis", totalPages - 2, totalPages - 1, totalPages];
  return [1, "start-ellipsis", page, "end-ellipsis", totalPages];
}

// แก้จากต้นฉบับ InitStudio: export สไตล์ track / item / lifted เพื่อใช้ซ้ำใน SegmentedControl
// แก้จากต้นฉบับ InitStudio: แทร็กเป็นแคปซูลขอบบาง ตัวเลือกที่เลือกเป็นสีหลักของเว็บ (แทนแผ่นสีขาวลอยบนแทร็กเทา)
export const track =
  "flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5";
export const item =
  "relative inline-flex h-8 select-none items-center justify-center rounded-md text-[14px] font-medium tabular-nums text-foreground transition-[background-color,color,opacity,scale] duration-150 ease-out [-webkit-tap-highlight-color:transparent] enabled:active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none motion-reduce:enabled:active:scale-100";
export const lifted = "bg-brand";
// ปุ่มก่อนหน้า/ถัดไป: พื้นรองสีอุ่น ไม่แย่งความเด่นจากหน้าปัจจุบัน
const chip = "bg-surface-2 hover:bg-line";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const reduced = useReducedMotion();
  const indicatorId = useId();
  const spring = reduced ? { duration: 0 } : ({ type: "spring", duration: 0.38, bounce: 0 } as const);

  return (
    // แก้จากต้นฉบับ InitStudio: ข้อความและ aria-label ทั้งหมดเป็นภาษาไทย
    <nav aria-label="แบ่งหน้า" className={cn(track, className)}>
      <button
        type="button"
        aria-label="หน้าก่อนหน้า"
        disabled={page === 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className={cn(item, chip, "gap-1 pl-[9px] pr-[13px] disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-[34px] max-sm:px-0")}
      >
        <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" className="text-foreground/55" />
        <span className="max-sm:hidden">ก่อนหน้า</span>
      </button>

      {paginationRange(page, totalPages).map((entry) =>
        typeof entry === "number" ? (
          <button
            key={entry}
            type="button"
            aria-label={`หน้า ${entry}`}
            aria-current={entry === page ? "page" : undefined}
            onClick={() => onPageChange(entry)}
            className={cn(
              item,
              "min-w-9 px-1.5 hover:bg-foreground/5 aria-[current=page]:font-semibold aria-[current=page]:text-brand-fg aria-[current=page]:hover:bg-transparent max-sm:min-w-8",
            )}
          >
            {entry === page && (
              <motion.span
                layoutId={indicatorId}
                transition={spring}
                className={cn("absolute inset-0 rounded-md", lifted)}
              />
            )}
            <span className="relative">{entry}</span>
          </button>
        ) : (
          <span key={entry} aria-hidden="true" className="grid h-8 w-[30px] place-items-center text-[14px] text-foreground/50 max-sm:w-5">
            …
          </span>
        ),
      )}

      <button
        type="button"
        aria-label="หน้าถัดไป"
        disabled={page === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className={cn(item, chip, "gap-1 pl-[13px] pr-[9px] disabled:cursor-not-allowed disabled:opacity-50 max-sm:w-[34px] max-sm:px-0")}
      >
        <span className="max-sm:hidden">ถัดไป</span>
        <ChevronRight size={16} strokeWidth={2.25} aria-hidden="true" className="text-foreground/55" />
      </button>
    </nav>
  );
}

export type RowsPerPageProps<T extends number> = {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  className?: string;
};

export function RowsPerPage<T extends number>({ value, options, onChange, className }: RowsPerPageProps<T>) {
  const reduced = useReducedMotion();
  const indicatorId = useId();
  const spring = reduced ? { duration: 0 } : ({ type: "spring", duration: 0.38, bounce: 0 } as const);

  return (
    <div role="group" aria-label="จำนวนแถวต่อหน้า" className={cn(track, className)}>
      {options.map((rows) => (
        <button
          key={rows}
          type="button"
          aria-pressed={rows === value}
          aria-label={`${rows} แถวต่อหน้า`}
          onClick={() => onChange(rows)}
          className={cn(item, "min-w-10 px-3 hover:bg-foreground/5 aria-pressed:font-semibold aria-pressed:text-brand-fg aria-pressed:hover:bg-transparent")}
        >
          {rows === value && <motion.span layoutId={indicatorId} transition={spring} className={cn("absolute inset-0 rounded-md", lifted)} />}
          <span className="relative">{rows === value ? `${rows} แถว` : rows}</span>
        </button>
      ))}
    </div>
  );
}
