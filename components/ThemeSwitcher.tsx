"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ThemeMode } from "@/components/ui/ThemeMode";
import { applyThemeMode, readThemeMode, saveThemeMode, subscribeThemeMode } from "@/lib/theme";

// ปุ่มสลับธีมที่มุมขวาบน เชื่อม ThemeMode เข้ากับตัวจัดการธีม
export function ThemeSwitcher() {
  // อ่านค่าที่เลือกไว้จาก localStorage (ฝั่งเซิร์ฟเวอร์ยังไม่รู้ จึงใช้ "system" ไปก่อน)
  const mode = useSyncExternalStore(subscribeThemeMode, readThemeMode, () => "system" as const);

  // ถ้าเลือก "ตามระบบ" ให้เปลี่ยนธีมทันทีเมื่อเครื่องสลับโหมดสว่าง/มืด
  useEffect(() => {
    applyThemeMode(mode);
    if (mode !== "system") return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeMode("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode]);

  return <ThemeMode value={mode} onValueChange={saveThemeMode} />;
}
