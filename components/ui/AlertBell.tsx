// components/ui/AlertBell.tsx
"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { cn } from "@/lib/utils";

const CARD = 60;
const GAP = 10;
const PEEK = 12;
const SHRINK = 0.055;
const EASE = [0.22, 1, 0.36, 1] as const;

export type AlertNotification = {
  id: string;
  title: string;
  detail: string;
  icon: ReactNode;
  tone: string;
};

export type AlertBellProps = {
  count: number;
  soundEnabled?: boolean;
  // แก้จากต้นฉบับ InitStudio: เพิ่ม callback ของสวิตช์ปิด/เปิดเสียงในแผงแจ้งเตือน
  onSoundEnabledChange?: (enabled: boolean) => void;
  notifications?: AlertNotification[];
  maxVisible?: number;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  composition?: "add" | "replace";
  className?: string;
};

export function AlertBell({
  count,
  soundEnabled = true,
  onSoundEnabledChange,
  notifications,
  maxVisible = 4,
  defaultOpen = false,
  onOpenChange,
  composition = "add",
  className,
}: AlertBellProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const bellControls = useAnimationControls();
  const badgeControls = useAnimationControls();
  const playArrival = useArrivalSound(soundEnabled);
  const previous = useRef(count);
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const reduced = useReducedMotion();
  const visible = notifications?.slice(0, maxVisible) ?? [];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const expanded = hovered || focused || pinned;
  const total = visible.length;
  const stackHeight = !total ? 0 : expanded ? total * CARD + (total - 1) * GAP : CARD + Math.min(total - 1, 2) * PEEK;
  const stackMotion = reduced ? { duration: 0.12 } : { duration: 0.42, ease: EASE };

  useEffect(() => {
    if (count > previous.current) {
      playArrival();
      if (!reduced) {
        void bellControls.start({ rotate: [0, -8, 4, -2, 1, -.5, .25, 0], transition: { duration: .6, ease: "easeInOut" } });
        void badgeControls.start({ scale: [1, 1.15, .94, 1.04, 1], rotate: [0, -6, 4, -1.5, 0], transition: { duration: .5, ease: "easeOut", delay: .08 } });
      }
    }
    previous.current = count;
  }, [count, reduced, playArrival, bellControls, badgeControls]);

  const toggle = useCallback((next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  }, [onOpenChange]);

  // แก้จากต้นฉบับ InitStudio: แผงลอยแบบ dropdown จึงปิดเมื่อคลิกที่อื่นนอกแผง
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) toggle(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, toggle]);

  return (
    <div
      ref={rootRef}
      // แก้จากต้นฉบับ InitStudio: ใช้ relative เพื่อให้แผงลอยอยู่ใต้กระดิ่ง (ต้นฉบับเรียงแผงไว้เหนือปุ่ม)
      className={cn("relative flex flex-col items-end", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          toggle(false);
          ref.current?.focus();
        }
      }}
    >
      <button
        ref={ref}
        type="button"
        onClick={() => toggle(!open)}
        data-composition={composition}
        // แก้จากต้นฉบับ InitStudio: aria-label ภาษาไทย
        aria-label={count ? `การแจ้งเตือน ยังไม่อ่าน ${count} รายการ` : "การแจ้งเตือน"}
        aria-expanded={notifications ? open : undefined}
        aria-controls={notifications && open ? panelId : undefined}
        // แก้จากต้นฉบับ InitStudio: ลดขนาดปุ่มจาก 60px เป็น 44px ให้พอดี header
        className="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-[12px] bg-transparent text-neutral-800 transition-[scale,background-color] duration-150 hover:bg-neutral-100 motion-safe:active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 home-dark:text-neutral-100 home-dark:hover:bg-white/10"
      >
        <motion.span animate={bellControls} style={{ transformOrigin: "50% 24%", display: "inline-flex" }}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 4.25c-3.2 0-5.5 2.55-5.5 5.75v3.6c0 .85-.34 1.66-.94 2.26l-.55.55c-.44.44-.13 1.19.49 1.19h13c.62 0 .93-.75.49-1.19l-.55-.55a3.2 3.2 0 0 1-.94-2.26V10c0-3.2-2.3-5.75-5.5-5.75Z" />
          <path d="M9.75 17.6a2.25 2.25 0 0 0 4.5 0" />
        </svg>
        </motion.span>
        {/* แก้จากต้นฉบับ InitStudio: ลดขนาดตัวเลขบนกระดิ่งให้สมส่วนกับปุ่มที่เล็กลง */}
        <motion.span
          animate={badgeControls}
          aria-hidden="true"
          data-visible={count > 0 || undefined}
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 scale-50 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff5a6c,#e2263d)] px-1 text-[11px] font-bold leading-none text-white tabular-nums opacity-0 shadow-[inset_0_1px_1px_rgb(255_255_255/0.35),0_0_0_2px_var(--background),0_4px_10px_rgb(226_38_61/0.35)] transition-[scale,opacity] duration-200 ease-out data-[visible]:scale-100 data-[visible]:opacity-100 motion-reduce:transition-none home-dark:shadow-[inset_0_1px_1px_rgb(255_255_255/0.3),0_0_0_2px_var(--background),0_4px_10px_rgb(0_0_0/0.5)]"
        >
          <NumberFlow value={Math.min(Math.max(count, 1), 9)} suffix={count > 9 ? "+" : undefined} />
        </motion.span>
      </button>

      {notifications && (
        <AnimatePresence initial={false}>
          {open && (
            // แก้จากต้นฉบับ InitStudio: แผงลอยใต้กระดิ่ง ชิดขวา กว้างประมาณ 320px มีพื้นหลังการ์ด
            <motion.section
              key="panel"
              id={panelId}
              aria-label="การแจ้งเตือน"
              initial={{ opacity: 0, y: reduced ? 0 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="absolute top-full right-0 z-40 mt-2 w-[320px] max-w-[calc(100vw-24px)] rounded-2xl border border-neutral-200 bg-neutral-100 p-2 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_8px_-2px_rgb(0_0_0/0.06),0_12px_24px_-8px_rgb(0_0_0/0.12)] home-dark:border-neutral-800 home-dark:bg-neutral-800"
            >
              <div className="flex items-center justify-between gap-3 px-2 pt-1 pb-2.5">
                <span className="text-[14px] font-semibold text-neutral-800 home-dark:text-neutral-100">การแจ้งเตือนล่าสุด</span>
                {/* แก้จากต้นฉบับ InitStudio: เพิ่มสวิตช์ปิดเสียงแจ้งเตือน (ส่งค่าเข้า prop soundEnabled) */}
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-500 home-dark:text-neutral-400">
                  เสียงแจ้งเตือน
                  <button
                    type="button"
                    role="switch"
                    aria-checked={soundEnabled}
                    aria-label="เปิดหรือปิดเสียงแจ้งเตือน"
                    onClick={() => onSoundEnabledChange?.(!soundEnabled)}
                    className="relative h-6 w-10 shrink-0 cursor-pointer rounded-full bg-neutral-300 transition-colors duration-150 outline-none aria-checked:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 motion-reduce:transition-none home-dark:bg-neutral-600 home-dark:aria-checked:bg-sky-500"
                  >
                    <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform duration-150 motion-reduce:transition-none", soundEnabled && "translate-x-4")} />
                  </button>
                </label>
              </div>
              {total === 0 && (
                <p className="rounded-[12px] bg-white px-3 py-5 text-center text-[13px] text-neutral-500 home-dark:bg-neutral-900 home-dark:text-neutral-400">ยังไม่มีการแจ้งเตือน</p>
              )}
              <motion.ul
                tabIndex={total ? 0 : -1}
                aria-label={expanded ? "รายการแจ้งเตือน แสดงทั้งหมด" : "รายการแจ้งเตือน ซ้อนกันอยู่ ชี้ แตะ หรือโฟกัสเพื่อกางออก"}
                initial={false}
                animate={{ height: stackHeight }}
                transition={stackMotion}
                onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
                onPointerLeave={(event) => {
                  if (event.pointerType !== "mouse") return;
                  setHovered(false);
                  setPinned(false);
                }}
                onPointerUp={(event) => event.pointerType !== "mouse" && setPinned((value) => !value)}
                onFocus={(event) => event.currentTarget.matches(":focus-visible") && setFocused(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
                }}
                className="relative m-0 w-full cursor-pointer list-none rounded-[16px] p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
              >
                <AnimatePresence initial={false}>
                  {visible.map((item, index) => {
                    const depth = Math.min(index, 3);
                    const shrink = depth * SHRINK;
                    // แก้จากต้นฉบับ InitStudio: แผงอยู่ใต้กระดิ่ง จึงให้การ์ดเก่าโผล่ลงด้านล่าง (ค่า y เป็นบวก) แทนการโผล่ขึ้นด้านบน
                    const slot = expanded
                      ? { y: index * (CARD + GAP), scale: 1, opacity: 1 }
                      : { y: depth * PEEK + shrink * CARD, scale: 1 - shrink, opacity: index < 3 ? 1 : 0 };
                    return (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: reduced ? -8 : -24, scale: reduced ? 1 : 0.96 }}
                        animate={slot}
                        exit={{ opacity: 0, y: reduced ? -8 : -24, scale: reduced ? 1 : 0.96 }}
                        transition={{ ...stackMotion, opacity: { duration: reduced ? 0.12 : 0.22 } }}
                        style={{ "--tone": item.tone, zIndex: visible.length - index, transformOrigin: "50% 0%" } as CSSProperties}
                        className="absolute inset-x-0 top-0 h-[60px] rounded-[16px] border border-neutral-200 bg-white shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-4px_rgb(0_0_0/0.08)] home-dark:border-neutral-700 home-dark:bg-neutral-900 home-dark:shadow-[0_4px_12px_-4px_rgb(0_0_0/0.3)]"
                      >
                        <motion.div
                          initial={false}
                          animate={{ opacity: expanded || index === 0 ? 1 : 0 }}
                          transition={{ duration: reduced ? 0 : 0.18 }}
                          className="flex h-full items-center gap-3 px-3 py-2.5"
                        >
                          {/* แก้จากต้นฉบับ InitStudio: ไอคอนใช้สี tone ของแต่ละรายการ (สีระดับฝุ่น) */}
                          <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--tone)_14%,var(--background))] text-[color-mix(in_srgb,var(--tone)_88%,var(--foreground))] [&_svg]:size-[17px]"
                          >
                            {item.icon}
                          </span>
                          <span className="grid min-w-0 gap-0.5">
                            <strong className="truncate text-[14px] font-medium text-neutral-900 home-dark:text-neutral-100">
                              {item.title}
                            </strong>
                            <span className="truncate text-[12px] text-neutral-500 home-dark:text-neutral-400">{item.detail}</span>
                          </span>
                        </motion.div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </motion.ul>
            </motion.section>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function useArrivalSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => () => { void ctxRef.current?.close().catch(() => {}); }, []);
  return useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      let ctx = ctxRef.current;
      if (!ctx) ctx = ctxRef.current = new AC();
      if (ctx.state === "suspended") void ctx.resume().catch(() => {});
      const now = ctx.currentTime;
      const tone = (freq: number, at: number, dur: number, peak: number) => {
        const osc = ctx!.createOscillator();
        const gain = ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + at);
        gain.gain.setValueAtTime(0.0001, now + at);
        gain.gain.exponentialRampToValueAtTime(peak, now + at + 0.008); // fast attack
        gain.gain.exponentialRampToValueAtTime(0.0001, now + at + dur); // bell-ish decay
        osc.connect(gain).connect(ctx!.destination);
        osc.start(now + at);
        osc.stop(now + at + dur + 0.02);
      };
      // A soft, bright two-note "ding" (B5 → E6), kept at a low level.
      tone(987.77, 0, 0.18, 0.06);
      tone(1318.51, 0.08, 0.22, 0.05);
    } catch {
      /* AudioContext blocked/unavailable — fail silent */
    }
  }, [enabled]);
}
