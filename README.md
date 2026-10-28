# PM.Notify Dashboard

เว็บแดชบอร์ดของโครงงาน IoT **PM.Notify — ระบบตรวจวัดคุณภาพอากาศอัจฉริยะ** (ม.2 ปีการศึกษา 2569)
สร้างด้วย Next.js 16 + Tailwind CSS v4 + components จาก InitStudio และกราฟจาก Recharts

## 1. วิธีรัน

ต้องมี [Node.js](https://nodejs.org) เวอร์ชัน 20 ขึ้นไป

```bash
npm install          # ติดตั้งแพ็กเกจ (ครั้งแรกครั้งเดียว)
npm run dev          # โหมดพัฒนา เปิด http://localhost:3000
npm run build        # สร้างเว็บสำหรับใช้งานจริง
npm start            # รันเว็บที่ build แล้ว
```

ค่าเริ่มต้นเป็นโหมด **mock** (ข้อมูลจำลอง เปลี่ยนทุก 5 วินาที)

## 2. เชื่อมกับ Firebase (ข้อมูลจริง)

1. เข้า <https://console.firebase.google.com> → **Add project** ตั้งชื่อ เช่น `pm-notify`
2. เมนู **Build > Realtime Database** → **Create Database** เลือก location `asia-southeast1 (Singapore)` → เริ่มแบบ *locked mode*
3. แท็บ **Rules** วางเนื้อหาจากไฟล์ `firebase-rules.json` แล้วกด **Publish**
   (ทุกคนอ่านค่าได้ แต่เขียนได้เฉพาะบอร์ดที่มี Database secret และมี index ให้ค้นประวัติตามเวลา)
4. **Project settings** (ไอคอนเฟือง) → **Your apps** → กดไอคอน `</>` เพิ่ม Web app → คัดลอกค่า `firebaseConfig`
5. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่า:

   ```bash
   NEXT_PUBLIC_DATA_MODE=firebase
   NEXT_PUBLIC_DEVICE_ID=pmnotify-01
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pm-notify.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://pm-notify-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=pm-notify
   NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
   ```

6. รัน `npm run dev` ใหม่ (ต้องรันใหม่ทุกครั้งที่แก้ `.env.local`)

โครงสร้างข้อมูลใน Realtime Database:

```
devices/
  pmnotify-01/
    latest:  { device_id, timestamp, pm1, pm25, pm10, temperature, humidity, battery, status }
    history/
      -Nx8a...: { ...ค่าเดียวกัน }
```

> ทดสอบได้โดยไม่ต้องมีบอร์ด: ในหน้า Realtime Database กดเพิ่มข้อมูลที่ `devices/pmnotify-01/latest`
> ตามรูปแบบ JSON ด้านล่าง (ใช้ `timestamp` เป็นเวลาปัจจุบัน ไม่อย่างนั้นเว็บจะขึ้นว่าออฟไลน์)

```json
{
  "device_id": "pmnotify-01",
  "timestamp": "2026-11-01T08:30:00+07:00",
  "pm1": 12.4, "pm25": 28.6, "pm10": 41.2,
  "temperature": 31.5, "humidity": 68.2,
  "battery": 76, "status": "online"
}
```

## 3. โค้ด Arduino (ESP32)

ไฟล์ `arduino/pm_notify/pm_notify.ino` สำหรับ Seeed Studio XIAO ESP32-C6

1. Arduino IDE → **Boards Manager** ติดตั้ง `esp32` by Espressif (3.x) แล้วเลือกบอร์ด `XIAO_ESP32C6`
2. **Library Manager** ติดตั้ง `Adafruit BME280 Library`, `Adafruit Unified Sensor`, `U8g2`
3. แก้ค่าด้านบนของไฟล์: `WIFI_SSID`, `WIFI_PASS`, `FIREBASE_URL` (ค่าเดียวกับ `DATABASE_URL`)
   และ `FIREBASE_SECRET` (Project settings → **Service accounts** → **Database secrets** → Show)
4. อัปโหลด แล้วเปิด Serial Monitor (115200) ดูผล ถ้าส่งสำเร็จจะเห็น `PUT /devices/pmnotify-01/latest -> 200`

การทำงานแต่ละรอบ: ตื่น → อุ่นเซนเซอร์ฝุ่น 30 วินาที → อ่านค่าเฉลี่ย 10 ครั้ง → แสดงบน OLED → ต่อ Wi-Fi
→ ขอเวลาจาก NTP → `PUT latest` + `POST history` → Deep Sleep 2 นาที
แบตต่ำกว่า 30% ส่ง `status: "deep_sleep"` แล้วหลับ 30 นาที, ต่ำกว่า 10% ปิดระบบ

> ⚠️ Database secret เป็นรหัสลับ อย่าอัปโหลดไฟล์ .ino ที่ใส่รหัสแล้วขึ้น GitHub

## 4. โครงสร้างไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `components/ui/*` | components จาก InitStudio (จุดที่แก้มีคอมเมนต์ `แก้จากต้นฉบับ InitStudio`) |
| `components/ui/SegmentedControl.tsx` | ไฟล์ใหม่ สร้างจากสไตล์ RowsPerPage |
| `components/DataProvider.tsx` | รับข้อมูล คำนวณระดับฝุ่น และส่งแจ้งเตือน (toast, กระดิ่ง, เบราว์เซอร์) |
| `components/pages/*` | เนื้อหาแต่ละหน้า |
| `lib/dataService.ts` | ดึงข้อมูล โหมด mock / firebase |
| `lib/airQuality.ts` | ระดับสี PM2.5 ตามกรมควบคุมมลพิษ |
| `lib/analysis.ts` | ค่าเฉลี่ย 24 ชม., ช่วงที่เกินเกณฑ์, CSV |
| `lib/theme.ts`, `components/ThemeSwitcher.tsx` | ธีมสว่าง/มืด/ตามระบบ |

## 5. สัญญาอนุญาต

เผยแพร่ภายใต้ [Creative Commons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.th) ดูรายละเอียดในไฟล์ `LICENSE`
(ไม่รวม components จาก InitStudio และไลบรารีอื่น ๆ ซึ่งเป็นไปตามสัญญาอนุญาตของเจ้าของแต่ละราย)
