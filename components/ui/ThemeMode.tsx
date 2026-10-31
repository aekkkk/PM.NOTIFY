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
    <div role="group" aria-label="เลือกธีม" className={cn("inline-flex gap-0.5 rounded-lg border border-line bg-surface p-0.5", className)}>
      {modes.map(({ value: mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          aria-label={label}
          title={mode === "system" ? "ตามระบบ — ใช้โหมดสว่าง/มืดตามที่ตั้งไว้ในเครื่อง" : label}
          aria-pressed={selected === mode}
          onClick={() => { setInternalValue(mode); onValueChange?.(mode); }}
          className="relative grid size-8 cursor-pointer place-items-center rounded-md text-muted outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 aria-pressed:text-brand-fg home-dark:hover:text-foreground"
        >
          {selected === mode && (
            <motion.span
              aria-hidden="true"
              layoutId={reduced ? undefined : `${id}-theme-indicator`}
              initial={false}
              transition={reduced ? { duration: 0 } : { type: "spring", duration: 0.35, bounce: 0 }}
              className="absolute inset-0 rounded-md bg-brand"
            />
          )}
          <Icon aria-hidden="true" size={18} strokeWidth={2} className="relative" />
        </button>
      ))}
    </div>
  );
}
