// คำนวณข้อมูลสรุปจากประวัติค่าฝุ่น: ค่าเฉลี่ย 24 ชม., ช่วงที่เกินเกณฑ์, ไฟล์ CSV และย่อข้อมูลสำหรับกราฟ
import { PM25_THRESHOLD } from "@/lib/airQuality";
import { toTime, type Reading } from "@/lib/dataService";

// ค่าเฉลี่ย PM2.5 ย้อนหลัง 24 ชม. นับจากค่าล่าสุด
export function average24h(history: Reading[]) {
  if (!history.length) return null;
  const end = toTime(history[history.length - 1]);
  const values = history.filter((r) => toTime(r) > end - 24 * 3600_000).map((r) => r.pm25);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export type Exceedance = {
  id: string;
  start: number;
  end: number;
  peak: number;
  ongoing: boolean;
};

// หา "ช่วงที่ PM2.5 เกินเกณฑ์" แต่ละครั้ง (ถ้าลดลงแป๊บเดียวไม่ถึง 15 นาทีแล้วเกินอีก นับเป็นครั้งเดียวกัน)
export function findExceedances(history: Reading[], mergeGapMs = 15 * 60_000): Exceedance[] {
  const result: Exceedance[] = [];
  let current: Exceedance | null = null;
  for (const reading of history) {
    const t = toTime(reading);
    if (reading.pm25 > PM25_THRESHOLD) {
      if (current && t - current.end <= mergeGapMs) {
        current.end = t;
        current.peak = Math.max(current.peak, reading.pm25);
        current.ongoing = true;
      } else {
        current = { id: reading.timestamp, start: t, end: t, peak: reading.pm25, ongoing: true };
        result.push(current);
      }
    } else if (current) {
      current.ongoing = false;
    }
  }
  return result.reverse(); // ใหม่สุดอยู่บน
}

// นับจำนวนครั้งที่เกินเกณฑ์ "วันนี้" (ตามเวลาไทย)
export function countToday(events: Exceedance[], now: number) {
  const thaiDay = (ms: number) => Math.floor((ms + 7 * 3600_000) / 86400_000);
  return events.filter((e) => thaiDay(e.start) === thaiDay(now)).length;
}

// ย่อจำนวนจุดให้กราฟไม่หนักเกินไป โดยเฉลี่ยค่าในแต่ละช่วง
// เฉลี่ยความกดอากาศโดยข้ามค่า 0 (ไม่มีข้อมูล) ถ้าทั้งช่วงไม่มีค่าเลยให้ 0
function avgPressure(group: Reading[]) {
  const valid = group.filter((r) => r.pressure > 0);
  return valid.length ? Math.round((valid.reduce((sum, r) => sum + r.pressure, 0) / valid.length) * 10) / 10 : 0;
}

export function downsample(history: Reading[], maxPoints: number) {
  if (history.length <= maxPoints) return history;
  const size = Math.ceil(history.length / maxPoints);
  const out: Reading[] = [];
  for (let i = 0; i < history.length; i += size) {
    const group = history.slice(i, i + size);
    const avg = (key: "pm1" | "pm25" | "pm10" | "temperature" | "humidity") =>
      Math.round((group.reduce((sum, r) => sum + r[key], 0) / group.length) * 10) / 10;
    out.push({ ...group[group.length - 1], pm1: avg("pm1"), pm25: avg("pm25"), pm10: avg("pm10"), temperature: avg("temperature"), humidity: avg("humidity"), pressure: avgPressure(group) });
  }
  return out;
}

// สร้างไฟล์ CSV แล้วให้เบราว์เซอร์ดาวน์โหลด (ใส่ BOM เพื่อให้ Excel อ่านภาษาไทยได้)
export function downloadCsv(history: Reading[]) {
  const header = "timestamp,pm1,pm25,pm10,temperature,humidity,pressure,battery,status";
  const rows = history.map((r) => [r.timestamp, r.pm1, r.pm25, r.pm10, r.temperature, r.humidity, r.pressure, r.battery, r.status].join(","));
  const blob = new Blob(["﻿" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pm-notify-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
