"use client";

// หน้าความรู้เรื่องฝุ่น ใช้ Accordion กางอ่านทีละหัวข้อ
import { Droplets, Info, Palette, ShieldCheck, Wind } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { StatusBadge } from "@/components/ui/Badge";
import { AIR_LEVELS } from "@/lib/airQuality";

export function Knowledge() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">ความรู้เรื่องฝุ่น</h1>
        <p className="mt-1 text-[14px] text-neutral-500 home-dark:text-neutral-400">เรื่องที่ควรรู้ก่อนอ่านค่าจากเครื่อง PM.Notify</p>
      </div>

      <Accordion type="single" collapsible defaultValue="what">
        <AccordionItem value="what">
          <AccordionTrigger icon={<Wind size={18} />}>PM2.5 และ PM10 คืออะไร</AccordionTrigger>
          <AccordionContent>
            <p>
              PM ย่อมาจาก Particulate Matter แปลว่า &quot;ฝุ่นละออง&quot; ตัวเลขข้างหลังบอกขนาดเป็นไมโครเมตร (µm) <strong>PM10</strong> คือฝุ่นที่เล็กกว่า 10 ไมโครเมตร ส่วน
              <strong> PM2.5</strong> เล็กกว่า 2.5 ไมโครเมตร หรือประมาณ 1 ใน 25 ของความกว้างเส้นผม จึงมองด้วยตาเปล่าไม่เห็น
            </p>
            <p className="mt-2">
              PM2.5 อันตรายกว่าเพราะเล็กมากจนผ่านจมูกเข้าไปลึกถึงถุงลมในปอด และบางส่วนเข้าสู่กระแสเลือดได้ แหล่งที่มาสำคัญคือไอเสียรถยนต์ การเผาในที่โล่ง และโรงงาน
              ค่าที่เครื่องแสดงมีหน่วยเป็น µg/m³ (ไมโครกรัมต่อลูกบาศก์เมตร) คือน้ำหนักฝุ่นในอากาศ 1 ลูกบาศก์เมตร
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="levels">
          <AccordionTrigger icon={<Palette size={18} />}>ระดับสีคุณภาพอากาศ</AccordionTrigger>
          <AccordionContent>
            <p>ตามดัชนีคุณภาพอากาศของกรมควบคุมมลพิษ (ใช้ตั้งแต่ 1 มิ.ย. 2566) โดยเกณฑ์มาตรฐาน PM2.5 เฉลี่ย 24 ชั่วโมงของไทยคือ 37.5 µg/m³</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-[13px]">
                <thead className="text-foreground/60">
                  <tr>
                    <th scope="col" className="py-2 pr-3 font-medium">PM2.5 (µg/m³)</th>
                    <th scope="col" className="py-2 pr-3 font-medium">ระดับ</th>
                    <th scope="col" className="py-2 font-medium">คำแนะนำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/10">
                  {AIR_LEVELS.map((level) => (
                    <tr key={level.key}>
                      <td className="py-2 pr-3 whitespace-nowrap tabular-nums">{level.range}</td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={level.badge}>{level.label}</StatusBadge>
                      </td>
                      <td className="py-2">{level.advice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="protect">
          <AccordionTrigger icon={<ShieldCheck size={18} />}>วิธีป้องกันตัวเมื่อฝุ่นสูง</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-1 pl-5">
              <li>สวมหน้ากาก N95 ให้แนบสนิทกับใบหน้า (หน้ากากผ้าและหน้ากากอนามัยกันฝุ่น PM2.5 ได้น้อย)</li>
              <li>งดหรือลดการออกกำลังกายและกิจกรรมกลางแจ้ง โดยเฉพาะช่วงเช้าและเย็นที่รถติด</li>
              <li>ปิดประตูหน้าต่าง และใช้เครื่องฟอกอากาศในห้องที่อยู่นาน ๆ</li>
              <li>เด็ก ผู้สูงอายุ และผู้มีโรคหอบหืดหรือโรคหัวใจ ควรระวังเป็นพิเศษ</li>
              <li>ถ้ามีอาการไอ แน่นหน้าอก หายใจลำบาก หรือแสบตา ให้รีบเข้าอาคารและปรึกษาแพทย์</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="humidity">
          <AccordionTrigger icon={<Droplets size={18} />}>ทำไมความชื้นสูงทำให้ค่าฝุ่นเพี้ยน</AccordionTrigger>
          <AccordionContent>
            <p>
              เซนเซอร์ PMSA003 ใช้หลัก <strong>การกระเจิงแสง</strong> (light scattering) พัดลมเล็ก ๆ ดูดอากาศผ่านลำแสงเลเซอร์ เมื่ออนุภาคผ่านแสงจะสะท้อนแสงกระจายออกไป
              เซนเซอร์นับจำนวนและประเมินขนาดอนุภาคจากแสงที่กระเจิงนั้น แล้วคำนวณเป็นค่า PM1.0 / PM2.5 / PM10
            </p>
            <p className="mt-2">
              เมื่ออากาศชื้นมาก (ประมาณเกิน 80–85 %RH) ฝุ่นบางชนิดจะดูดน้ำจนพองตัว และละอองน้ำหรือหมอกก็กระเจิงแสงได้เหมือนฝุ่น เซนเซอร์จึงอ่านค่าได้
              <strong>สูงกว่าความจริง</strong> เราจึงใช้ BME280 วัดความชื้นไปพร้อมกัน เพื่อเตือนว่าค่าในช่วงนั้นอาจคลาดเคลื่อน และใช้เป็นข้อมูลปรับเทียบ
              (calibrate) โดยเทียบกับสถานีตรวจวัดของกรมควบคุมมลพิษที่อยู่ใกล้ ๆ แล้วหาค่าแก้ตามระดับความชื้น
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="limits">
          <AccordionTrigger icon={<Info size={18} />}>ข้อจำกัดของเครื่องต้นแบบ</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-1 pl-5">
              <li>เป็นต้นแบบเพื่อการเรียนรู้ ไม่ใช่เครื่องมือวัดมาตรฐานทางการ ค่าอาจต่างจากสถานีของกรมควบคุมมลพิษ</li>
              <li>เซนเซอร์ราคาประหยัดวัดได้ในช่วง 0–500 µg/m³ และคลาดเคลื่อนได้เมื่อความชื้นสูง</li>
              <li>อ่านค่าทุก 1–5 นาที ระหว่างรอบเครื่องจะ sleep เพื่อประหยัดไฟ ค่าบนเว็บจึงไม่ใช่วินาทีต่อวินาที</li>
              <li>ใช้พลังงานจากโซลาร์เซลล์ 6V และแบตเตอรี่ 18650: แบตต่ำกว่า 30% เครื่องเข้า Deep Sleep และต่ำกว่า 10% ปิดระบบ</li>
              <li>ต้องมี Wi-Fi จึงจะส่งข้อมูลได้ ถ้าเว็บไม่ได้รับข้อมูลเกิน 10 นาที จะแสดงว่าเครื่องออฟไลน์</li>
              <li>การแจ้งเตือนบนเบราว์เซอร์ทำงานเฉพาะตอนเปิดหน้าเว็บค้างไว้</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
