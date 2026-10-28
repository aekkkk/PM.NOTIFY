// components/ui/EmptyState.tsx
// Also requires: @/lib/utils
"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
};

// แก้จากต้นฉบับ InitStudio: แยกคลาสปุ่มสีฟ้าไล่เฉดออกมา export เพื่อใช้เป็นปุ่มหลักทั้งเว็บ
export const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[10px] border border-sky-600 bg-linear-to-b from-[lab(70.687_-23.6078_-45.9483)] to-[lab(63.3038_-18.433_-51.0407)] px-4 py-2 text-[15px] leading-6 font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.38),inset_0_-1px_0_rgb(0_70_110/0.24),0_1px_2px_rgb(0_100_160/0.24)] transition-[filter,scale] duration-150 ease-out hover:brightness-[1.03] motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500";

function CheckoutIllustration() {
  return (
    <svg aria-hidden="true" viewBox="0 0 72 72" fill="none" className="size-[66px] text-[#3979e8] home-dark:text-sky-400">
      <path d="M6 17v46a4 4 0 0 0 4 4h31M66 17v28" stroke="currentColor" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
      <rect x="6" y="7" width="60" height="13" rx="4" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="25" width="30" height="13" rx="4" fill="currentColor" fillOpacity=".2" stroke="currentColor" strokeWidth="2" />
      <path d="m46 43 20 15-12 1-5 8-3-24Z" fill="var(--background)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyState({
  title = "No checkout links yet.",
  description = "You haven’t created any checkout links yet. Create one-off checkout links to onboard users quickly.",
  actionLabel = "Create checkout link",
  actionIcon,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const entrance = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 12, filter: reduced ? "none" : "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: reduced ? 0.12 : 0.3, delay: reduced ? 0 : delay, ease: "easeOut" as const },
  });

  return (
    <section aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} className={cn("flex w-[480px] max-w-full flex-col items-center px-6 py-8 text-center text-neutral-950 home-dark:text-neutral-100", className)}>
      <motion.div {...entrance(0)} aria-hidden="true" className="mb-6">{icon ?? <CheckoutIllustration />}</motion.div>
      <motion.h3 {...entrance(0.1)} id={`${id}-title`} className="m-0 text-[26px] leading-[1.2] font-semibold tracking-[-0.03em] text-balance">{title}</motion.h3>
      <motion.p {...entrance(0.2)} id={`${id}-description`} className="mt-3 max-w-[44ch] text-[15px] leading-[1.65] text-pretty text-neutral-500 home-dark:text-neutral-400">{description}</motion.p>
      <motion.div {...entrance(0.3)} className="mt-6">
        <button type="button" onClick={onAction} className={primaryButton}>{actionIcon && <span aria-hidden="true" className="grid size-4 place-items-center [&>svg]:size-4">{actionIcon}</span>}{actionLabel}</button>
      </motion.div>
    </section>
  );
}
