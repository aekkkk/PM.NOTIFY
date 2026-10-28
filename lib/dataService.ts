// lib/dataService.ts
// ส่วนดึงข้อมูลจากเครื่อง PM.Notify รวมไว้ไฟล์เดียว มี 2 โหมด สลับด้วย NEXT_PUBLIC_DATA_MODE
//   - "mock"     : จำลองค่าขึ้นมาเองทุก 5 วินาที (ใช้ตอนพัฒนาและตอนนำเสนอ)
//   - "firebase" : อ่านค่าจริงจาก Firebase Realtime Database ที่บอร์ด ESP32 ส่งขึ้นไป
import { initializeApp, getApps } from "firebase/app";
import {
  getDatabase,
  goOffline,
  goOnline,
  limitToLast,
  onChildAdded,
  onValue,
  orderByChild,
  query,
  ref,
  startAt,
  type Database,
} from "firebase/database";

// ---------- รูปแบบข้อมูล (ตรงกับ JSON ที่บอร์ดส่งมา) ----------
export type DeviceStatus = "online" | "deep_sleep";

export type Reading = {
  device_id: string;
  timestamp: string; // ISO 8601 เช่น "2026-11-01T08:30:00+07:00"
  pm1: number;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  battery: number;
  status: DeviceStatus;
};

export type DataSnapshot = {
  latest: Reading | null;
  history: Reading[]; // เรียงจากเก่าไปใหม่
};

export type DataMode = "mock" | "firebase";

export const DATA_MODE: DataMode = process.env.NEXT_PUBLIC_DATA_MODE === "firebase" ? "firebase" : "mock";
export const DEVICE_ID = process.env.NEXT_PUBLIC_DEVICE_ID || "pmnotify-01";

// ถ้าไม่มีข้อมูลใหม่เกิน 10 นาที ให้ถือว่าเครื่อง offline
export const OFFLINE_AFTER_MS = 10 * 60 * 1000;
// เก็บประวัติย้อนหลัง 7 วัน (ช่วงยาวที่สุดของกราฟ)
export const HISTORY_MS = 7 * 24 * 60 * 60 * 1000;

export const toTime = (reading: Reading) => new Date(reading.timestamp).getTime();

// แปลงเวลาเป็น ISO แบบเขตเวลาไทย (+07:00) ให้รูปแบบเดียวกับที่บอร์ดส่ง
export function toThaiIso(ms: number) {
  const shifted = new Date(ms + 7 * 60 * 60 * 1000).toISOString().slice(0, 19);
  return `${shifted}+07:00`;
}

// ---------- จุดเริ่มต้นที่หน้าเว็บเรียกใช้ ----------
// subscribe() จะเรียก onChange ทุกครั้งที่มีข้อมูลใหม่ และคืนฟังก์ชันสำหรับเลิกฟัง
export function subscribe(onChange: (snapshot: DataSnapshot) => void, onError?: (message: string) => void) {
  return DATA_MODE === "firebase" ? subscribeFirebase(onChange, onError) : subscribeMock(onChange);
}

// ปุ่ม "ลองเชื่อมต่ออีกครั้ง"
export function reconnect() {
  if (DATA_MODE === "firebase") {
    const db = getFirebaseDb();
    if (db) {
      goOffline(db);
      goOnline(db);
    }
  } else {
    mockControls.setOffline(false);
  }
}

// =====================================================================
// โหมด mock: สร้างข้อมูลจำลองที่ดูสมจริง (ฝุ่นสูงช่วงเช้าและเย็นตามการจราจร)
// =====================================================================

// ค่าสุ่มที่ใช้ทั้งรอบ ให้กราฟแต่ละวันไม่เหมือนกัน (สุ่มตอนเริ่ม subscribeMock บนเบราว์เซอร์)
let phase = [0, 0, 0];
let dayFactors = [1];
const gauss = (x: number, mid: number, width: number) => Math.exp(-((x - mid) ** 2) / (2 * width * width));

function simulate(ms: number, boost: number): Reading {
  const date = new Date(ms);
  const hour = (date.getUTCHours() + 7) % 24 + date.getUTCMinutes() / 60; // ชั่วโมงตามเวลาไทย
  const day = Math.floor((ms / 86400000) % dayFactors.length);
  const minutes = ms / 60000;
  // ฝุ่นพื้นฐาน + ช่วงเช้า (8 โมง) + ช่วงเย็น (1 ทุ่ม) + คลื่นเล็ก ๆ ให้ดูเป็นธรรมชาติ
  const pm25 = Math.max(
    3,
    16 +
      24 * gauss(hour, 8, 1.4) * dayFactors[day] +
      30 * gauss(hour, 19.5, 2.2) * dayFactors[(day + 3) % dayFactors.length] +
      3.5 * Math.sin(minutes / 37 + phase[0]) +
      2 * Math.sin(minutes / 11 + phase[1]) +
      (Math.random() - 0.5) * 1.6 +
      boost,
  );
  const temperature = 28.5 + 4.5 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + 0.4 * Math.sin(minutes / 23 + phase[2]);
  const humidity = 68 - 14 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + 2 * Math.sin(minutes / 29);
  // แบตเตอรี่: ชาร์จด้วยโซลาร์เซลล์ตอนกลางวัน ค่อย ๆ ลดตอนกลางคืน
  const battery = 72 + 18 * Math.sin(((hour - 10) / 24) * 2 * Math.PI);
  const round = (value: number) => Math.round(value * 10) / 10;
  return {
    device_id: DEVICE_ID,
    timestamp: toThaiIso(ms),
    pm1: round(pm25 * 0.68),
    pm25: round(pm25),
    pm10: round(pm25 * 1.42 + 4 + Math.random() * 2),
    temperature: round(temperature),
    humidity: round(Math.min(98, Math.max(20, humidity))),
    battery: Math.round(battery),
    status: "online",
  };
}

type MockState = { highDust: boolean; offline: boolean };
let mockState: MockState = { highDust: false, offline: false }; // สร้างออบเจกต์ใหม่ทุกครั้งที่เปลี่ยน ให้ React รู้ว่าค่าเปลี่ยน
const mockListeners = new Set<() => void>();
let mockKick: (() => void) | null = null;

// ปุ่มควบคุมสำหรับสาธิตตอนนำเสนอ (มีผลเฉพาะโหมด mock)
export const mockControls = {
  get state(): MockState {
    return mockState;
  },
  setHighDust(on: boolean) {
    mockState = { ...mockState, highDust: on };
    mockListeners.forEach((listener) => listener());
    mockKick?.();
  },
  setOffline(on: boolean) {
    mockState = { ...mockState, offline: on };
    mockListeners.forEach((listener) => listener());
    mockKick?.();
  },
  listen(listener: () => void) {
    mockListeners.add(listener);
    return () => void mockListeners.delete(listener);
  },
};

function subscribeMock(onChange: (snapshot: DataSnapshot) => void) {
  const STEP = 5 * 60 * 1000; // ประวัติย้อนหลังทุก 5 นาที
  phase = [Math.random() * 6, Math.random() * 6, Math.random() * 6];
  dayFactors = Array.from({ length: 10 }, () => 0.55 + Math.random() * 1.15);
  const now = Date.now();
  const history: Reading[] = [];
  for (let t = now - HISTORY_MS; t < now; t += STEP) history.push(simulate(t, 0));

  let boost = 0;
  let latest: Reading | null = null;

  const tick = () => {
    if (mockState.offline) {
      // จำลองว่าเครื่องหายไปนานกว่า 10 นาที: เลื่อนเวลาค่าล่าสุดถอยหลัง 11 นาที
      if (latest) {
        latest = { ...latest, timestamp: toThaiIso(Date.now() - OFFLINE_AFTER_MS - 60_000) };
        onChange({ latest, history: [...history] });
      }
      return;
    }
    // ค่อย ๆ ไต่ขึ้น/ลง เพื่อให้เห็นการแจ้งเตือนทีละขั้น (เหลือง → ส้ม → แดง)
    boost += ((mockState.highDust ? 78 : 0) - boost) * 0.25;
    if (Math.abs(boost) < 0.2) boost = 0;
    latest = simulate(Date.now(), boost);
    history.push(latest);
    while (history.length && toTime(history[0]) < Date.now() - HISTORY_MS) history.shift();
    onChange({ latest, history: [...history] });
  };

  tick();
  const timer = setInterval(tick, 5000);
  mockKick = tick;
  return () => {
    clearInterval(timer);
    mockKick = null;
  };
}

// =====================================================================
// โหมด firebase: อ่านจาก Realtime Database
//   /devices/pmnotify-01/latest            ← ค่าล่าสุด
//   /devices/pmnotify-01/history/{pushId}  ← ประวัติทุกค่า
// =====================================================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseDb(): Database | null {
  if (!firebaseConfig.databaseURL) return null;
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  return getDatabase(app);
}

// ตรวจและแปลงข้อมูลจาก Firebase ให้เป็นตัวเลขเสมอ (กันกรณีบอร์ดส่งมาเป็นข้อความ)
function parseReading(value: unknown): Reading | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const num = (key: string) => Number(raw[key]);
  const reading: Reading = {
    device_id: String(raw.device_id ?? DEVICE_ID),
    timestamp: String(raw.timestamp ?? ""),
    pm1: num("pm1"),
    pm25: num("pm25"),
    pm10: num("pm10"),
    temperature: num("temperature"),
    humidity: num("humidity"),
    battery: num("battery"),
    status: raw.status === "deep_sleep" ? "deep_sleep" : "online",
  };
  if (!Number.isFinite(reading.pm25) || Number.isNaN(toTime(reading))) return null;
  return reading;
}

function subscribeFirebase(onChange: (snapshot: DataSnapshot) => void, onError?: (message: string) => void) {
  const db = getFirebaseDb();
  if (!db) {
    onError?.("ยังไม่ได้ตั้งค่า Firebase ใน .env.local");
    return () => {};
  }
  const base = `devices/${DEVICE_ID}`;
  let latest: Reading | null = null;
  const history: Reading[] = [];
  let pending: ReturnType<typeof setTimeout> | null = null;

  // รวมการอัปเดตหลายครั้งที่มาติดกันให้เหลือครั้งเดียว (ตอนโหลดประวัติครั้งแรกจะมีเป็นพันรายการ)
  const emit = () => {
    if (pending) return;
    pending = setTimeout(() => {
      pending = null;
      history.sort((a, b) => toTime(a) - toTime(b));
      onChange({ latest, history: [...history] });
    }, 120);
  };

  const fail = (error: Error) => onError?.(`อ่านข้อมูลจาก Firebase ไม่ได้: ${error.message}`);

  const offLatest = onValue(
    ref(db, `${base}/latest`),
    (snap) => {
      latest = parseReading(snap.val());
      emit();
    },
    fail,
  );

  // ดึงเฉพาะประวัติ 7 วันล่าสุด (timestamp เป็น ISO จึงเรียงตามตัวอักษรได้)
  const historyQuery = query(
    ref(db, `${base}/history`),
    orderByChild("timestamp"),
    startAt(toThaiIso(Date.now() - HISTORY_MS)),
    limitToLast(12000),
  );
  const offHistory = onChildAdded(
    historyQuery,
    (snap) => {
      const reading = parseReading(snap.val());
      if (reading) history.push(reading);
      emit();
    },
    fail,
  );

  return () => {
    offLatest();
    offHistory();
    if (pending) clearTimeout(pending);
  };
}
