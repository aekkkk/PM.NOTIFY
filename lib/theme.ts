// จัดการธีมสว่าง/มืด: เก็บค่าที่ผู้ใช้เลือกไว้ใน localStorage คีย์ "pm-theme"
import type { ThemeModeValue } from "@/components/ui/ThemeMode";

export const THEME_KEY = "pm-theme";

// สคริปต์สั้น ๆ ที่รันใน <head> ก่อนหน้าเว็บแสดง เพื่อไม่ให้จอกะพริบเป็นสีขาวตอนเปิดในโหมดมืด
export const themeScript = `(function(){try{var m=localStorage.getItem("${THEME_KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-home-theme",d?"dark":"light")}catch(e){document.documentElement.setAttribute("data-home-theme","light")}})()`;

export function readThemeMode(): ThemeModeValue {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {}
  return "system";
}

// แปลงค่าที่เลือก (light / dark / system) เป็นธีมจริง แล้วตั้งที่ <html data-home-theme="...">
export function applyThemeMode(mode: ThemeModeValue) {
  const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-home-theme", dark ? "dark" : "light");
}

// ให้ component รู้เมื่อค่าธีมที่เก็บไว้เปลี่ยน (ใช้กับ useSyncExternalStore)
const listeners = new Set<() => void>();
export function subscribeThemeMode(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function saveThemeMode(mode: ThemeModeValue) {
  try {
    localStorage.setItem(THEME_KEY, mode); // เก็บ "system" ด้วย ไม่ใช่แค่ผลลัพธ์
  } catch {}
  listeners.forEach((listener) => listener());
}
