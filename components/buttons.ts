// ปุ่มหลักทั้งเว็บ: แคปซูลสีหลัก (นิยามไว้ใน EmptyState)
export { primaryButton } from "@/components/ui/EmptyState";

// ปุ่มรอง: ขอบบาง ขนาดเท่าปุ่มหลัก
export const secondaryButton =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2 text-[15px] leading-6 font-medium text-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-surface-2 motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-brand aria-pressed:bg-brand-soft aria-pressed:text-brand";
