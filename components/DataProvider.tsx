"use client";

// ศูนย์กลางข้อมูลของทั้งเว็บ: รับค่าจาก dataService แล้วคำนวณสถานะ ระดับฝุ่น และส่งการแจ้งเตือน
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { BatteryLow, TriangleAlert, WifiOff, Wind } from "lucide-react";
import type { AlertNotification } from "@/components/ui/AlertBell";
import { useToastStack } from "@/components/ui/ToastStack";
import { AIR_LEVELS, PM25_THRESHOLD, fmt1, fmtTime, getAirLevel, getAlertZone, type AirLevel, type AlertZone } from "@/lib/airQuality";
import { average24h, countToday, findExceedances, type Exceedance } from "@/lib/analysis";
import { DATA_MODE, OFFLINE_AFTER_MS, mockControls, reconnect, subscribe, toTime, type Reading } from "@/lib/dataService";

type DataContextValue = {
  latest: Reading | null;
  history: Reading[];
  now: number | null;
  loading: boolean;
  offline: boolean; // ไม่มีข้อมูลใหม่เกิน 10 นาที
  noData: boolean; // ยังไม่เคยได้รับข้อมูลเลย
  error: string | null;
  level: AirLevel | null;
  avg24: number | null;
  exceedances: Exceedance[];
  todayCount: number;
  notifications: AlertNotification[];
  unread: number;
  markRead: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (on: boolean) => void;
  browserPermission: NotificationPermission | "unsupported";
  enableBrowserNotifications: () => Promise<void>;
  reconnect: () => void;
  mock: { enabled: boolean; highDust: boolean; offline: boolean; setHighDust: (on: boolean) => void; setOffline: (on: boolean) => void };
};

const DataContext = createContext<DataContextValue | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData ต้องใช้ภายใน DataProvider");
  return ctx;
}

// ค่าตั้งค่าที่อ่านจากเบราว์เซอร์ (เสียงแจ้งเตือน, สิทธิ์แจ้งเตือน) ใช้กับ useSyncExternalStore
const settingListeners = new Set<() => void>();
const subscribeSettings = (listener: () => void) => {
  settingListeners.add(listener);
  return () => void settingListeners.delete(listener);
};
const notifySettings = () => settingListeners.forEach((listener) => listener());
const readSound = () => {
  try {
    return localStorage.getItem("pm-sound") !== "off";
  } catch {
    return true;
  }
};
const readPermission = (): NotificationPermission | "unsupported" =>
  typeof Notification === "undefined" ? "unsupported" : Notification.permission;
const serverMockState = { highDust: false, offline: false };

const levelColor = (key: AirLevel["key"]) => AIR_LEVELS.find((l) => l.key === key)!.color;

export function DataProvider({ children }: { children: ReactNode }) {
  const toast = useToastStack();
  const [latest, setLatest] = useState<Reading | null>(null);
  const [history, setHistory] = useState<Reading[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const soundEnabled = useSyncExternalStore(subscribeSettings, readSound, () => true);
  const browserPermission = useSyncExternalStore(subscribeSettings, readPermission, () => "default" as const);
  const mockState = useSyncExternalStore(mockControls.listen, () => mockControls.state, () => serverMockState);
  const idRef = useRef(0);

  // ---------- เชื่อมต่อแหล่งข้อมูล ----------
  useEffect(() => {
    const stop = subscribe(
      (snapshot) => {
        setLatest(snapshot.latest);
        setHistory(snapshot.history);
        setLoaded(true);
        setError(null);
        setNow(Date.now());
      },
      (message) => {
        setError(message);
        setLoaded(true);
      },
    );
    // ในโหมด firebase ถ้ายังไม่มีข้อมูลภายใน 8 วินาที ให้เลิกแสดงสถานะกำลังโหลด
    const giveUp = setTimeout(() => setLoaded(true), 8000);
    return () => {
      stop();
      clearTimeout(giveUp);
    };
  }, []);

  // นาฬิกาของหน้าเว็บ: อัปเดตทุก 15 วินาที ใช้คำนวณ "x นาทีที่แล้ว" และตรวจว่าเครื่อง offline หรือยัง
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const setSoundEnabled = useCallback((on: boolean) => {
    try {
      localStorage.setItem("pm-sound", on ? "on" : "off");
    } catch {}
    notifySettings();
  }, []);

  // ---------- ค่าที่คำนวณจากข้อมูล ----------
  const offline = latest !== null && now !== null && now - toTime(latest) > OFFLINE_AFTER_MS;
  const level = latest ? getAirLevel(latest.pm25) : null;
  const avg24 = useMemo(() => average24h(history), [history]);
  const exceedances = useMemo(() => findExceedances(history), [history]);
  const todayCount = now ? countToday(exceedances, now) : 0;

  // ---------- การแจ้งเตือน ----------
  const pushBell = useCallback((item: Omit<AlertNotification, "id">, countAsUnread = true) => {
    idRef.current += 1;
    const entry = { ...item, id: `n${idRef.current}` };
    setNotifications((list) => [entry, ...list].slice(0, 20));
    if (countAsUnread) setUnread((n) => n + 1);
  }, []);

  const notifyBrowser = useCallback((title: string, body: string) => {
    // แจ้งเตือนบนเบราว์เซอร์ (ทำงานเมื่อเปิดหน้าเว็บค้างไว้ และผู้ใช้อนุญาตแล้ว)
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      new Notification(title, { body, tag: "pm-notify", icon: "/icon.svg" });
    } catch {}
  }, []);

  // ใส่ประวัติการเกินเกณฑ์ล่าสุดลงในกระดิ่งตอนโหลดครั้งแรก (ไม่นับเป็นยังไม่อ่าน)
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !exceedances.length) return;
    seeded.current = true;
    exceedances
      .slice(0, 4)
      .reverse()
      .forEach((e) => {
        const zone = getAlertZone(e.peak);
        pushBell(
          {
            title: zone === "danger" ? "PM2.5 สูงมาก" : "PM2.5 เกินเกณฑ์",
            detail: `${fmt1(e.peak)} µg/m³ · ${fmtTime(new Date(e.start))}`,
            icon: <TriangleAlert />,
            tone: levelColor(zone === "danger" ? "unhealthy" : "sensitive"),
          },
          false,
        );
      });
  }, [exceedances, pushBell]);

  // แจ้งเตือนเฉพาะตอนค่า "ข้ามเกณฑ์" ไม่ใช่ทุกครั้งที่ข้อมูลอัปเดต
  const prevZone = useRef<AlertZone | null>(null);
  useEffect(() => {
    if (!latest || offline) return;
    const zone = getAlertZone(latest.pm25);
    const before = prevZone.current ?? "ok"; // ครั้งแรกถือว่าเดิมปกติ ถ้าเปิดมาแล้วเกินก็แจ้งทันที
    prevZone.current = zone;
    if (zone === before) return;
    const value = `${fmt1(latest.pm25)} µg/m³`;
    const time = fmtTime(new Date(latest.timestamp));

    if (zone === "danger" && before !== "danger") {
      const description = `ตอนนี้ ${value} ฝุ่นอยู่ในระดับมีผลกระทบต่อสุขภาพ งดกิจกรรมกลางแจ้ง และสวมหน้ากาก N95`;
      toast.add({ type: "error", title: "ฝุ่น PM2.5 สูงมาก", description, timeout: 10000 });
      pushBell({ title: "PM2.5 สูงมาก", detail: `${value} · ${time}`, icon: <TriangleAlert />, tone: levelColor("unhealthy") });
      notifyBrowser("ฝุ่น PM2.5 สูงมาก", description);
    } else if (zone === "warning" && before === "ok") {
      const description = `ตอนนี้ ${value} เกินเกณฑ์ ${PM25_THRESHOLD} สวมหน้ากาก N95 และงดกิจกรรมกลางแจ้ง`;
      toast.add({ type: "warning", title: "ฝุ่น PM2.5 เกินมาตรฐาน", description, timeout: 10000 });
      pushBell({ title: "PM2.5 เกินเกณฑ์", detail: `${value} · ${time}`, icon: <TriangleAlert />, tone: levelColor("sensitive") });
      notifyBrowser("ฝุ่น PM2.5 เกินมาตรฐาน", description);
    } else if (zone === "ok") {
      const description = `ตอนนี้ ${value} ต่ำกว่าเกณฑ์ ${PM25_THRESHOLD} แล้ว`;
      toast.add({ type: "success", title: "คุณภาพอากาศกลับมาปกติ", description });
      pushBell({ title: "ฝุ่นกลับมาปกติ", detail: `${value} · ${time}`, icon: <Wind />, tone: getAirLevel(latest.pm25).color });
      notifyBrowser("คุณภาพอากาศกลับมาปกติ", description);
    }
  }, [latest, offline, toast, pushBell, notifyBrowser]);

  // แจ้งเมื่อเครื่องขาดการเชื่อมต่อ / กลับมาออนไลน์
  const prevOffline = useRef(false);
  useEffect(() => {
    if (offline === prevOffline.current) return;
    prevOffline.current = offline;
    if (offline) {
      const description = "ไม่ได้รับข้อมูลจากเครื่องเกิน 10 นาที ตรวจ Wi-Fi และแบตเตอรี่ของเครื่อง";
      toast.add({ type: "declined", title: "เครื่องขาดการเชื่อมต่อ", description, timeout: 10000 });
      pushBell({ title: "เครื่องออฟไลน์", detail: `ขาดการเชื่อมต่อ · ${now ? fmtTime(new Date(now)) : ""}`, icon: <WifiOff />, tone: "#737373" });
      notifyBrowser("เครื่องขาดการเชื่อมต่อ", description);
      prevZone.current = null; // กลับมาออนไลน์แล้วให้ประเมินระดับฝุ่นใหม่
    } else {
      toast.add({ type: "success", title: "เครื่องกลับมาออนไลน์", description: "ได้รับข้อมูลใหม่จากเครื่องแล้ว" });
    }
  }, [offline, now, toast, pushBell, notifyBrowser]);

  // แจ้งเมื่อแบตเตอรี่ต่ำกว่า 30% (เครื่องจะเข้า Deep Sleep)
  const prevLowBattery = useRef(false);
  useEffect(() => {
    if (!latest) return;
    const low = latest.battery < 30 || latest.status === "deep_sleep";
    if (low && !prevLowBattery.current) {
      pushBell({ title: "แบตเตอรี่ต่ำ", detail: `${latest.battery}% · เครื่องเข้าโหมด Deep Sleep`, icon: <BatteryLow />, tone: "#ff9900" });
    }
    prevLowBattery.current = low;
  }, [latest, pushBell]);

  const enableBrowserNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    notifySettings();
    if (result === "granted") {
      new Notification("เปิดการแจ้งเตือนแล้ว", { body: "PM.Notify จะแจ้งเมื่อฝุ่น PM2.5 เกินเกณฑ์ ขณะเปิดหน้าเว็บค้างไว้", icon: "/icon.svg" });
    }
  }, []);

  const value: DataContextValue = {
    latest,
    history,
    now,
    loading: !loaded,
    offline,
    noData: loaded && latest === null,
    error,
    level,
    avg24,
    exceedances,
    todayCount,
    notifications,
    unread,
    markRead: () => setUnread(0),
    soundEnabled,
    setSoundEnabled,
    browserPermission,
    enableBrowserNotifications,
    reconnect,
    mock: {
      enabled: DATA_MODE === "mock",
      highDust: mockState.highDust,
      offline: mockState.offline,
      setHighDust: mockControls.setHighDust,
      setOffline: mockControls.setOffline,
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
