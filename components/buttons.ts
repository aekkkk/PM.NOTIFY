// ปุ่มหลักทั้งเว็บใช้สไตล์ปุ่มสีฟ้าไล่เฉดจาก EmptyState ของ InitStudio
export { primaryButton } from "@/components/ui/EmptyState";

// ปุ่มรอง: พื้นขาวขอบเทา ขนาดเท่าปุ่มหลัก
export const secondaryButton =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-neutral-200 bg-white px-4 py-2 text-[15px] leading-6 font-medium text-neutral-800 shadow-xs transition-[background-color,scale] duration-150 ease-out hover:bg-neutral-50 motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-sky-500 aria-pressed:bg-sky-50 aria-pressed:text-sky-800 home-dark:border-neutral-700 home-dark:bg-neutral-900 home-dark:text-neutral-100 home-dark:hover:bg-neutral-800 home-dark:aria-pressed:bg-sky-950 home-dark:aria-pressed:text-sky-200";
