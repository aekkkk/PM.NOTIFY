"use client";

// หน้ากราฟย้อนหลัง: เลือกช่วงเวลา แล้วแสดงกราฟ PM2.5 + PM10 และกราฟอุณหภูมิ + ความชื้น
import { useMemo, useState, type ReactNode } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useData } from "@/components/DataProvider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { PM25_THRESHOLD, fmt1 } from "@/lib/airQuality";
import { downsample } from "@/lib/analysis";
import { toTime } from "@/lib/dataService";

const ranges = [
  { value: "1h", label: "1 ชม.", ms: 3600_000 },
  { value: "24h", label: "24 ชม.", ms: 24 * 3600_000 },
  { value: "7d", label: "7 วัน", ms: 7 * 24 * 3600_000 },
] as const;
type RangeKey = (typeof ranges)[number]["value"];

// สีเส้นกราฟ
const COLORS = { pm25: "#55bbfa", pm10: "#a5a3ff", temperature: "#ff9900", humidity: "#00cceb" };

type Point = { t: number; pm25: number; pm10: number; temperature: number; humidity: number };

const series: Record<keyof typeof COLORS, { label: string; unit: string }> = {
  pm25: { label: "PM2.5", unit: "µg/m³" },
  pm10: { label: "PM10", unit: "µg/m³" },
  temperature: { label: "อุณหภูมิ", unit: "°C" },
  humidity: { label: "ความชื้น", unit: "%RH" },
};

// tooltip เป็นการ์ดขาวขอบมน 16px เงาแบบเดียวกับ ToastStack (รองรับโหมดมืดด้วย var(--background))
function ChartTooltip({ active, payload, label, range }: TooltipContentProps<ValueType, NameType> & { range: RangeKey }) {
  if (!active || !payload?.length) return null;
  const date = new Date(Number(label));
  const when =
    range === "7d"
      ? date.toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      : date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
  return (
    <div className="min-w-40 rounded-2xl bg-background px-3.5 py-3 text-[13px] text-foreground shadow-[0_0_0_1px_oklch(0_0_0/.06),0_1px_2px_-1px_oklch(0_0_0/.06),0_2px_4px_0_oklch(0_0_0/.04),0_12px_28px_-8px_oklch(0_0_0/.14)] home-dark:shadow-[0_0_0_1px_oklch(1_0_0/.08),0_12px_28px_-8px_oklch(0_0_0/.6)]">
      <p className="mb-1.5 font-semibold">{when} น.</p>
      {payload.map((entry) => {
        const key = entry.dataKey as keyof typeof series;
        return (
          <p key={key} className="flex items-center gap-2 tabular-nums">
            <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: COLORS[key] }} />
            <span className="text-foreground/65">{series[key].label}</span>
            <span className="ml-auto font-medium">
              {fmt1(Number(entry.value))} {series[key].unit}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function ChartCard({ title, legend, children }: { title: string; legend: (keyof typeof COLORS)[]; children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-100 home-dark:border-neutral-800 home-dark:bg-neutral-800">
      <header className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
        <h2 className="text-[15px] text-neutral-500 home-dark:text-neutral-400">{title}</h2>
        <ul className="ml-auto flex gap-3 text-[13px]">
          {legend.map((key) => (
            <li key={key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="h-[3px] w-4 rounded-full" style={{ background: COLORS[key] }} />
              {series[key].label}
            </li>
          ))}
        </ul>
      </header>
      <div className="-mx-px -mb-px h-72 rounded-2xl border border-neutral-200 bg-white px-1 pt-4 pb-1 shadow-xs text-neutral-400 sm:h-80 sm:px-3 home-dark:border-neutral-800 home-dark:bg-neutral-900 home-dark:text-neutral-500">{children}</div>
    </section>
  );
}

export function Charts() {
  const { history, loading } = useData();
  const [range, setRange] = useState<RangeKey>("24h");

  // ตัดข้อมูลให้เหลือเฉพาะช่วงที่เลือก แล้วย่อให้เหลือไม่เกิน 300 จุด
  const points = useMemo<Point[]>(() => {
    if (!history.length) return [];
    const end = toTime(history[history.length - 1]);
    const ms = ranges.find((r) => r.value === range)!.ms;
    const slice = history.filter((r) => toTime(r) >= end - ms);
    return downsample(slice, 300).map((r) => ({ t: toTime(r), pm25: r.pm25, pm10: r.pm10, temperature: r.temperature, humidity: r.humidity }));
  }, [history, range]);

  const tickFormat = (value: number) => {
    const date = new Date(value);
    return range === "7d"
      ? date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })
      : date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // ตั้งค่าที่ใช้ร่วมกันของกราฟทั้งสอง: เส้นหนา 2px ปลายมน เส้น grid จาง
  const axis = { stroke: "currentColor", tick: { fill: "currentColor", fontSize: 12 }, tickLine: false, axisLine: false } as const;
  const line = { type: "monotone", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", dot: false, activeDot: { r: 4, strokeWidth: 2, stroke: "var(--background)" }, isAnimationActive: false } as const;
  const xAxis = <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={tickFormat} minTickGap={28} {...axis} />;
  const grid = <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />;
  const tooltip = <Tooltip content={(props) => <ChartTooltip {...props} range={range} />} cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }} />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight">กราฟย้อนหลัง</h1>
        <SegmentedControl label="เลือกช่วงเวลาของกราฟ" value={range} options={ranges} onChange={setRange} />
      </div>

      {loading ? (
        <p className="py-16 text-center text-neutral-500">กำลังโหลดข้อมูล…</p>
      ) : !points.length ? (
        <p className="py-16 text-center text-neutral-500">ยังไม่มีข้อมูลในช่วงเวลานี้</p>
      ) : (
        <div className="grid gap-4">
          <ChartCard title="ฝุ่นละออง (µg/m³)" legend={["pm25", "pm10"]}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                {grid}
                {xAxis}
                <YAxis {...axis} width={44} domain={[0, (max: number) => Math.max(50, Math.ceil(max / 10) * 10)]} />
                {tooltip}
                <ReferenceLine y={PM25_THRESHOLD} stroke="#ff9900" strokeDasharray="6 5" strokeWidth={1.5} label={{ value: `เกณฑ์มาตรฐาน ${PM25_THRESHOLD}`, position: "insideTopRight", fill: "#ff9900", fontSize: 12 }} />
                <Line dataKey="pm10" name="PM10" stroke={COLORS.pm10} {...line} />
                <Line dataKey="pm25" name="PM2.5" stroke={COLORS.pm25} {...line} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="อุณหภูมิ (°C) และความชื้น (%RH)" legend={["temperature", "humidity"]}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 0, bottom: 0, left: -12 }}>
                {grid}
                {xAxis}
                <YAxis yAxisId="temp" {...axis} width={44} domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v: number) => Math.round(v).toString()} />
                <YAxis yAxisId="hum" orientation="right" {...axis} width={40} domain={[0, 100]} />
                {tooltip}
                <Line yAxisId="temp" dataKey="temperature" name="อุณหภูมิ" stroke={COLORS.temperature} {...line} />
                <Line yAxisId="hum" dataKey="humidity" name="ความชื้น" stroke={COLORS.humidity} {...line} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
