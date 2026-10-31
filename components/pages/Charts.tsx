"use client";

// หน้ากราฟย้อนหลัง: เลือกช่วงเวลา แล้วแสดงกราฟ PM2.5 + PM10 และกราฟอุณหภูมิ + ความชื้น
import { useMemo, useState, type ReactNode } from "react";
import { Area, CartesianGrid, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { useData } from "@/components/DataProvider";
import { PageHeader } from "@/components/ui/PageHeader";
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
// แก้จากต้นฉบับ: เปลี่ยนเป็นสีที่เข้มพอจะอ่านบนพื้นกระดาษ
const COLORS = { pm25: "var(--brand)", pm10: "#9a917c", temperature: "#e8590c", humidity: "#0891b2", pressure: "#5b6bc0" };

type Point = { t: number; pm25: number; pm10: number; temperature: number; humidity: number; pressure: number | null };

const series: Record<keyof typeof COLORS, { label: string; unit: string }> = {
  pm25: { label: "PM2.5", unit: "µg/m³" },
  pm10: { label: "PM10", unit: "µg/m³" },
  temperature: { label: "อุณหภูมิ", unit: "°C" },
  humidity: { label: "ความชื้น", unit: "%RH" },
  pressure: { label: "ความกดอากาศ", unit: "hPa" },
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
    <div className="min-w-40 rounded-lg bg-surface px-3.5 py-3 text-[13px] text-foreground shadow-[0_0_0_1px_var(--line),0_12px_28px_-8px_oklch(0_0_0/.2)]">
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
    <section className="card flex flex-col p-4 sm:p-5">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h2 className="text-[13px] font-medium text-muted">{title}</h2>
        <ul className="ml-auto flex gap-3 text-[13px]">
          {legend.map((key) => (
            <li key={key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: COLORS[key] }} />
              {series[key].label}
            </li>
          ))}
        </ul>
      </header>
      <div className="mt-3 h-72 text-muted sm:h-80">{children}</div>
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
    return downsample(slice, 300).map((r) => ({ t: toTime(r), pm25: r.pm25, pm10: r.pm10, temperature: r.temperature, humidity: r.humidity, pressure: r.pressure > 0 ? r.pressure : null }));
  }, [history, range]);

  const tickFormat = (value: number) => {
    const date = new Date(value);
    return range === "7d"
      ? date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })
      : date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // ตั้งค่าที่ใช้ร่วมกันของกราฟทั้งสอง: เส้นหนา 2px ปลายมน เส้น grid จาง
  const axis = { stroke: "currentColor", tick: { fill: "currentColor", fontSize: 12 }, tickLine: false, axisLine: false } as const;
  // แก้จากต้นฉบับ: เส้นหนา 2.5px
const line = { type: "monotone", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round", dot: false, activeDot: { r: 4, strokeWidth: 2, stroke: "var(--background)" }, isAnimationActive: false } as const;
  const xAxis = <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={tickFormat} minTickGap={28} {...axis} />;
  const grid = <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />;
  const tooltip = <Tooltip content={(props) => <ChartTooltip {...props} range={range} />} cursor={{ stroke: "currentColor", strokeOpacity: 0.2 }} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="กราฟย้อนหลัง"
        description="ค่าฝุ่น อุณหภูมิ ความชื้น และความกดอากาศย้อนหลัง"
        actions={<SegmentedControl label="เลือกช่วงเวลาของกราฟ" value={range} options={ranges} onChange={setRange} />}
      />

      {loading ? (
        <p className="py-16 text-center text-muted">กำลังโหลดข้อมูล…</p>
      ) : !points.length ? (
        <p className="py-16 text-center text-muted">ยังไม่มีข้อมูลในช่วงเวลานี้</p>
      ) : (
        <div className="grid gap-4">
          <ChartCard title="ฝุ่นละออง (µg/m³)" legend={["pm25", "pm10"]}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <defs>
                  <linearGradient id="pm25-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.pm25} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={COLORS.pm25} stopOpacity={0} />
                  </linearGradient>
                </defs>
                {grid}
                {xAxis}
                <YAxis {...axis} width={44} domain={[0, (max: number) => Math.max(50, Math.ceil(max / 10) * 10)]} />
                {tooltip}
                <ReferenceLine y={PM25_THRESHOLD} stroke="var(--muted)" strokeDasharray="6 5" strokeWidth={1.5} label={{ value: `เกณฑ์มาตรฐาน ${PM25_THRESHOLD}`, position: "insideTopRight", fill: "var(--muted)", fontSize: 12 }} />
                <Line dataKey="pm10" name="PM10" stroke={COLORS.pm10} {...line} />
                <Area dataKey="pm25" name="PM2.5" stroke={COLORS.pm25} fill="url(#pm25-fill)" {...line} />
              </ComposedChart>
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

          {points.some((p) => p.pressure !== null) && (
            <ChartCard title="ความกดอากาศ (hPa)" legend={["pressure"]}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  {grid}
                  {xAxis}
                  <YAxis {...axis} width={44} domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v: number) => Math.round(v).toString()} />
                  {tooltip}
                  <Line dataKey="pressure" name="ความกดอากาศ" stroke={COLORS.pressure} connectNulls={false} {...line} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}
