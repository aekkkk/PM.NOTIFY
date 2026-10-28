// components/ui/ThemeMode.tsx
"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeModeValue = "light" | "dark" | "system";
export type ThemeModeProps = {
  value?: ThemeModeValue;
  defaultValue?: ThemeModeValue;
  onValueChange?: (mode: ThemeModeValue) => void;
  className?: string;
};

// แก้จากต้นฉบับ InitStudio: เปลี่ยน label เป็นภาษาไทย
const modes = [
  { value: "light", label: "สว่าง", icon: Sun },
  { value: "dark", label: "มืด", icon: Moon },
  { value: "system", label: "ตามระบบ", icon: Monitor },
] as const;

export function ThemeMode({ value, defaultValue = "light", onValueChange, className }: ThemeModeProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const selected = value ?? internalValue;
  const id = useId();
  const reduced = useReducedMotion();

  return (
    // แก้จากต้นฉบับ InitStudio: aria-label และ title เป็นภาษาไทย
    <div role="group" aria-label="เลือกธีม" className={cn("inline-flex gap-1 rounded-full bg-neutral-200/70 p-1 home-dark:bg-white/10", className)}>
      {modes.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          title={mode === "system" ? "ตามระบบ — ใช้โหมดสว่าง/มืดตามที่ตั้งไว้ในเครื่อง" : label}
          aria-pressed={selected === mode}
          onClick={() => { setInternalValue(mode); onValueChange?.(mode); }}
          className="relative grid size-11 cursor-pointer place-items-center rounded-full text-neutral-500 outline-none hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 aria-pressed:text-neutral-900 home-dark:text-neutral-400 home-dark:hover:text-white home-dark:aria-pressed:text-white"
        >
          {selected === mode && (
            <motion.span
              aria-hidden="true"
              layoutId={reduced ? undefined : `${id}-theme-indicator`}
              initial={false}
              transition={reduced ? { duration: 0 } : { type: "spring", duration: 0.35, bounce: 0 }}
              className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.14),0_0_0_1px_rgb(0_0_0/0.05)] home-dark:bg-neutral-700 home-dark:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_1px_rgb(255_255_255/0.06)]"
            />
          )}
          <Icon aria-hidden="true" size={22} strokeWidth={1.8} className="relative" />
        </button>
      ))}
    </div>
  );
}
