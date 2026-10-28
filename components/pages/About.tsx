// หน้าเกี่ยวกับโครงงาน: ข้อมูลโครงงาน สมาชิก ครูที่ปรึกษา อุปกรณ์ และสัญญาอนุญาต
import type { ReactNode } from "react";
import { CcBadge, CcIcon } from "@/components/CcIcons";

const members = [
  { name: "เอก ปฐมจินดา", room: "ม.2/7", no: 18 },
  { name: "อริย์ธัช อัครไพบูลย์โรจน์", room: "ม.2/7", no: 24 },
  { name: "วรลภย์ คุโณปกรณ์", room: "ม.2/7", no: 40 },
  { name: "ศุภพร ส่วนเศรฐษา", room: "ม.2/8", no: 18 },
  { name: "ณดล วรพงศ์กิติพันธ์", room: "ม.2/8", no: 26 },
];

const equipment = [
  { name: "Seeed Studio XIAO ESP32-C6", role: "บอร์ดควบคุม อ่านเซนเซอร์และส่งข้อมูลผ่าน Wi-Fi" },
  { name: "เซนเซอร์ฝุ่น PMSA003", role: "วัด PM1.0 / PM2.5 / PM10 ช่วง 0–500 µg/m³" },
  { name: "BME280", role: "วัดอุณหภูมิและความชื้น" },
  { name: "จอ OLED 1.3 นิ้ว", role: "แสดงค่าที่ตัวเครื่อง" },
  { name: "แผงโซลาร์เซลล์ 6V", role: "ชาร์จแบตเตอรี่ตอนกลางวัน" },
  { name: "แบตเตอรี่ Li-ion 18650", role: "แหล่งพลังงานหลัก" },
  { name: "TP4056", role: "วงจรชาร์จแบตเตอรี่" },
  { name: "MT3608", role: "ยกแรงดันเป็น 5V ให้เซนเซอร์" },
];

// การ์ดโครงเดียวกับ LeadGoal
function Card({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col rounded-2xl border border-neutral-200 bg-neutral-100 home-dark:border-neutral-800 home-dark:bg-neutral-800 ${className ?? ""}`}>
      <h2 className="flex h-10 items-center px-4 text-[15px] text-neutral-500 home-dark:text-neutral-400">{title}</h2>
      <div className="-mx-px -mb-px flex-1 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs home-dark:border-neutral-800 home-dark:bg-neutral-900">{children}</div>
    </section>
  );
}

export function About() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">PM.Notify — ระบบตรวจวัดคุณภาพอากาศอัจฉริยะ</h1>
        <p className="mt-1 text-[14px] text-neutral-500 home-dark:text-neutral-400">
          โครงงาน Internet of Things รายวิชา Module AI &amp; Robotics ชั้นมัธยมศึกษาปีที่ 2 ภาคเรียนที่ 2 ปีการศึกษา 2569
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="หลักการทำงาน">
          <ul className="list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed">
            <li>เครื่องอ่านค่าฝุ่น อุณหภูมิ และความชื้น แล้วส่งขึ้นคลาวด์ (Firebase) ผ่าน Wi-Fi ทุก 1–5 นาที ระหว่างรอบเครื่องจะ sleep</li>
            <li>เว็บไซต์นี้ดึงค่ามาแสดงแบบเรียลไทม์ และแจ้งเตือนเมื่อ PM2.5 เกิน 37.5 µg/m³</li>
            <li>แบตเตอรี่ต่ำกว่า 30% → Deep Sleep, ต่ำกว่า 10% → ปิดระบบ</li>
            <li>เป็นต้นแบบเพื่อการเรียนรู้ ไม่ใช่เครื่องมือวัดมาตรฐานทางการ</li>
          </ul>
        </Card>

        <Card title="สมาชิกและครูที่ปรึกษา">
          <ol className="divide-y divide-neutral-100 text-[14px] home-dark:divide-neutral-800">
            {members.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                <span>{m.name}</span>
                <span className="shrink-0 text-neutral-500 tabular-nums home-dark:text-neutral-400">
                  {m.room} เลขที่ {m.no}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-neutral-100 pt-3 text-[14px] home-dark:border-neutral-800">
            <span className="text-neutral-500 home-dark:text-neutral-400">ครูที่ปรึกษา:</span> มาสเตอร์เอกราช วงศ์ชาลี
          </p>
        </Card>

        <Card title="อุปกรณ์ที่ใช้">
          <ul className="divide-y divide-neutral-100 text-[14px] home-dark:divide-neutral-800">
            {equipment.map((e) => (
              <li key={e.name} className="grid gap-0.5 py-2 first:pt-0 sm:grid-cols-[200px_1fr] sm:gap-3">
                <span className="font-medium">{e.name}</span>
                <span className="text-neutral-500 home-dark:text-neutral-400">{e.role}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* สัญญาอนุญาต: บอกว่าคนอื่นนำผลงานนี้ไปใช้ต่อได้แค่ไหน */}
        <Card title="สัญญาอนุญาต">
          <p className="flex flex-wrap items-center gap-2 font-medium"><CcBadge height={36} /> Creative Commons BY-NC-SA 4.0</p>
          <ul className="mt-2 flex flex-col gap-1 text-[14px] text-neutral-600 home-dark:text-neutral-300">
            <li className="flex items-center gap-2"><CcIcon part="by" /><span><span className="font-medium">แสดงที่มา (BY)</span> ต้องให้เครดิตผู้จัดทำโครงงาน PM.Notify</span></li>
            <li className="flex items-center gap-2"><CcIcon part="nc" /><span><span className="font-medium">ไม่ใช้เพื่อการค้า (NC)</span> ห้ามนำไปใช้หารายได้</span></li>
            <li className="flex items-center gap-2"><CcIcon part="sa" /><span><span className="font-medium">อนุญาตแบบเดียวกัน (SA)</span> ถ้าดัดแปลง ต้องเผยแพร่ด้วยสัญญาอนุญาตเดียวกัน</span></li>
          </ul>
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.th" target="_blank" rel="license noopener noreferrer" className="mt-3 inline-block text-[14px] text-[#3979e8] underline underline-offset-2 home-dark:text-sky-400">
            อ่านสัญญาอนุญาตฉบับเต็ม
          </a>
        </Card>
      </div>
    </div>
  );
}
