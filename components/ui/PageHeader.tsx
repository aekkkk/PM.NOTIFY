// หัวหน้าของทุกหน้า: หัวข้อ + คำอธิบาย (ไฟล์ใหม่ ไม่มีในต้นฉบับ InitStudio)
import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-[24px] leading-tight font-semibold tracking-tight text-balance sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
