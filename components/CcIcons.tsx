// สัญลักษณ์ Creative Commons (ไฟล์ทางการจาก creativecommons.org เก็บไว้ใน public/cc)
// ตอนธีมมืดใช้ invert กลับสี วงกลมขาว-ตัวดำ จะกลายเป็นวงกลมดำ-ตัวขาว
export type CcPart = "by" | "nc" | "sa";

export const CC_NAMES: Record<CcPart, string> = {
  by: "แสดงที่มา",
  nc: "ไม่ใช้เพื่อการค้า",
  sa: "อนุญาตแบบเดียวกัน",
};

export function CcIcon({ part, size = 20 }: { part: CcPart; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- ไอคอน SVG เล็ก ๆ ไม่ต้องใช้ next/image
  return <img src={`/cc/${part}.svg`} alt={CC_NAMES[part]} title={CC_NAMES[part]} width={size} height={size} className="inline-block home-dark:invert" />;
}

// ป้ายสัญญาอนุญาตแบบทางการ (88×31) ใช้สีของตัวเองได้ทั้งธีมสว่างและมืด
export function CcBadge({ height = 31 }: { height?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- ไฟล์ SVG ทางการ ไม่ต้องใช้ next/image
  return <img src="/cc/by-nc-sa.svg" alt="Creative Commons แสดงที่มา-ไม่ใช้เพื่อการค้า-อนุญาตแบบเดียวกัน 4.0" width={Math.round((height * 88) / 31)} height={height} className="inline-block" />;
}
