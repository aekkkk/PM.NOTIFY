import type { BadgeStatus } from "@/components/ui/Badge";

// เกณฑ์มาตรฐาน PM2.5 เฉลี่ย 24 ชม. ของประเทศไทย (µg/m³)
export const PM25_THRESHOLD = 37.5;
// เกินค่านี้ถือว่า "มีผลกระทบต่อสุขภาพ" (สีแดง)
export const PM25_DANGER = 75;

export type AirLevel = {
  key: "excellent" | "good" | "moderate" | "sensitive" | "unhealthy";
  label: string;
  color: string;
  badge: BadgeStatus;
  advice: string;
};

// ระดับสีตามดัชนีคุณภาพอากาศของกรมควบคุมมลพิษ (ใช้ตั้งแต่ 1 มิ.ย. 2566)
export const AIR_LEVELS: (AirLevel & { min: number; max: number; range: string })[] = [
  { key: "excellent", min: 0, max: 15, range: "0–15", label: "ดีมาก", color: "#55bbfa", badge: "aq-excellent", advice: "อากาศดีมาก เหมาะกับกิจกรรมกลางแจ้งและการท่องเที่ยว" },
  { key: "good", min: 15, max: 25, range: "15.1–25", label: "ดี", color: "#71d64c", badge: "aq-good", advice: "อากาศดี ทำกิจกรรมกลางแจ้งได้ตามปกติ" },
  { key: "moderate", min: 25, max: 37.5, range: "25.1–37.5", label: "ปานกลาง", color: "#dbc000", badge: "aq-moderate", advice: "ทำกิจกรรมกลางแจ้งได้ ผู้ที่ไวต่อฝุ่นควรสังเกตอาการ เช่น ไอ หายใจลำบาก" },
  { key: "sensitive", min: 37.5, max: 75, range: "37.6–75", label: "เริ่มมีผลกระทบต่อสุขภาพ", color: "#ff9900", badge: "aq-sensitive", advice: "ควรสวมหน้ากาก N95 เมื่อออกนอกอาคาร และลดเวลาทำกิจกรรมกลางแจ้ง" },
  { key: "unhealthy", min: 75, max: Infinity, range: "75.1 ขึ้นไป", label: "มีผลกระทบต่อสุขภาพ", color: "#e5484d", badge: "aq-unhealthy", advice: "งดกิจกรรมกลางแจ้ง สวมหน้ากาก N95 ทุกครั้งที่ออกนอกอาคาร และปิดประตูหน้าต่าง" },
];

// หาระดับคุณภาพอากาศจากค่า PM2.5 (ค่าที่เท่ากับขอบบนพอดียังนับเป็นระดับล่าง เช่น 37.5 = ปานกลาง)
export function getAirLevel(pm25: number): AirLevel {
  return AIR_LEVELS.find((level) => pm25 <= level.max) ?? AIR_LEVELS[AIR_LEVELS.length - 1];
}

// แบ่งเป็น 3 โซนไว้ตัดสินใจว่าต้องแจ้งเตือนหรือไม่ (แจ้งเฉพาะตอนข้ามโซน)
export type AlertZone = "ok" | "warning" | "danger";
export function getAlertZone(pm25: number): AlertZone {
  if (pm25 > PM25_DANGER) return "danger";
  if (pm25 > PM25_THRESHOLD) return "warning";
  return "ok";
}

// ทศนิยม 1 ตำแหน่งแบบไทย เช่น 28.6
export const fmt1 = (value: number) =>
  value.toLocaleString("th-TH", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// เวลาแบบ 08:30 น.
export const fmtTime = (date: Date) =>
  `${date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false })} น.`;

// วันที่แบบ 1 พ.ย. 69
export const fmtDate = (date: Date) =>
  date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" });

// ระยะเวลาแบบอ่านง่าย เช่น 1 ชม. 25 นาที
export function fmtDuration(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60000));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${minutes} นาที`;
  return rest ? `${hours} ชม. ${rest} นาที` : `${hours} ชม.`;
}
