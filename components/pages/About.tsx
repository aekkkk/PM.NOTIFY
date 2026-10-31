// หน้าเกี่ยวกับโครงงาน: ข้อมูลโครงงาน สมาชิก ครูที่ปรึกษา อุปกรณ์ และสัญญาอนุญาต
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
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

// การ์ดชั้นเดียวแบบเดียวกับ StatCard: หัวข้อตามด้วยเนื้อหา
function Card({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`card flex flex-col p-4 ${className ?? ""}`}>
      <h2 className="mb-3 text-[15px] font-semibold">{title}</h2>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function About() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="PM.Notify — ระบบตรวจวัดคุณภาพอากาศอัจฉริยะ"
        description="โครงงาน Internet of Things รายวิชา Module AI & Robotics ชั้นมัธยมศึกษาปีที่ 2 ภาคเรียนที่ 2 ปีการศึกษา 2569"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="หลักการทำงาน">
          <ul className="list-disc space-y-1.5 pl-5 marker:text-brand text-[14px] leading-relaxed">
            <li>เครื่องอ่านค่าฝุ่น อุณหภูมิ และความชื้น แล้วส่งขึ้นคลาวด์ (Firebase) ผ่าน Wi-Fi ทุก 1–5 นาที ระหว่างรอบเครื่องจะ sleep</li>
            <li>เว็บไซต์นี้ดึงค่ามาแสดงแบบเรียลไทม์ และแจ้งเตือนเมื่อ PM2.5 เกิน 37.5 µg/m³</li>
            <li>แบตเตอรี่ต่ำกว่า 30% → Deep Sleep, ต่ำกว่า 10% → ปิดระบบ</li>
            <li>เป็นต้นแบบเพื่อการเรียนรู้ ไม่ใช่เครื่องมือวัดมาตรฐานทางการ</li>
          </ul>
        </Card>

        <Card title="สมาชิกและครูที่ปรึกษา">
          <ol className="divide-y divide-line text-[14px]">
            {members.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                <span>{m.name}</span>
                <span className="shrink-0 text-muted tabular-nums">
                  {m.room} เลขที่ {m.no}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-line pt-3 text-[14px]">
            <span className="text-muted">ครูที่ปรึกษา:</span> มาสเตอร์เอกราช วงศ์ชาลี
          </p>
        </Card>

        <Card title="อุปกรณ์ที่ใช้">
          <ul className="divide-y divide-line text-[14px]">
            {equipment.map((e) => (
              <li key={e.name} className="grid gap-0.5 py-2 first:pt-0 sm:grid-cols-[200px_1fr] sm:gap-3">
                <span className="font-medium">{e.name}</span>
                <span className="text-muted">{e.role}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* สัญญาอนุญาต: บอกว่าคนอื่นนำผลงานนี้ไปใช้ต่อได้แค่ไหน */}
        <Card title="สัญญาอนุญาต">
          <p className="flex flex-wrap items-center gap-2 font-medium"><CcBadge height={36} /> Creative Commons BY-NC-SA 4.0</p>
          <ul className="mt-2 flex flex-col gap-1 text-[14px] text-foreground/80">
            <li className="flex items-center gap-2"><CcIcon part="by" /><span><span className="font-medium">แสดงที่มา (BY)</span> ต้องให้เครดิตผู้จัดทำโครงงาน PM.Notify</span></li>
            <li className="flex items-center gap-2"><CcIcon part="nc" /><span><span className="font-medium">ไม่ใช้เพื่อการค้า (NC)</span> ห้ามนำไปใช้หารายได้</span></li>
            <li className="flex items-center gap-2"><CcIcon part="sa" /><span><span className="font-medium">อนุญาตแบบเดียวกัน (SA)</span> ถ้าดัดแปลง ต้องเผยแพร่ด้วยสัญญาอนุญาตเดียวกัน</span></li>
          </ul>
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.th" target="_blank" rel="license noopener noreferrer" className="mt-3 inline-block text-[14px] text-brand underline underline-offset-4">
            อ่านสัญญาอนุญาตฉบับเต็ม
          </a>
        </Card>
      </div>
    </div>
  );
}
