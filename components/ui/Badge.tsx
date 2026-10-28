// components/ui/Badge.tsx
// Also requires: @/lib/utils
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const cut = "var(--badge-cut)";

const statusIcons = {
  queued: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 7v5l2.5 2" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  scheduled: (
    <>
      <rect x="3" y="4.5" width="18" height="17" rx="3.5" fill="currentColor" />
      <rect x="7" y="2" width="2" height="5" rx="1" fill="currentColor" />
      <rect x="15" y="2" width="2" height="5" rx="1" fill="currentColor" />
      <rect x="5.5" y="9.5" width="13" height="9.5" rx="1.5" fill={cut} />
      <text x="12" y="17.4" fill="currentColor" fontSize="7" fontWeight="700" textAnchor="middle">
        17
      </text>
    </>
  ),
  progress: (
    <>
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6a6 6 0 1 1-6 6h6z" fill="currentColor" />
    </>
  ),
  priority: (
    <>
      <path
        d="M12 2c1 3.5 5.5 5.6 5.5 11.3a5.5 5.5 0 0 1-11 0c0-2.6 1.3-4.3 2.5-5.5.2 1.7 1 2.7 2 3.1-.1-3.4-.1-6 1-8.9z"
        fill="currentColor"
      />
      <path d="M12 13.6c.9 1 2.3 1.8 2.3 3.6a2.3 2.3 0 0 1-4.6 0c0-1.1.6-1.9 1.3-2.4.2.6.5.9.9 1 0-.8 0-1.4.1-2.2z" fill={cut} />
    </>
  ),
  ready: (
    <>
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill="currentColor"
      />
      <path d="m9 12 2 2 4-4" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  waiting: (
    <>
      <circle cx="12" cy="13.5" r="8.5" fill="currentColor" />
      <rect x="9.5" y="1.5" width="5" height="2.2" rx="1.1" fill="currentColor" />
      <rect x="11.1" y="3" width="1.8" height="3" fill="currentColor" />
      <path d="m12 13.5 2.8-2.8" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  paused: (
    <>
      <path
        d="M8.3 2h7.4a1.5 1.5 0 0 1 1.06.44l4.8 4.8A1.5 1.5 0 0 1 22 8.3v7.4a1.5 1.5 0 0 1-.44 1.06l-4.8 4.8a1.5 1.5 0 0 1-1.06.44H8.3a1.5 1.5 0 0 1-1.06-.44l-4.8-4.8A1.5 1.5 0 0 1 2 15.7V8.3a1.5 1.5 0 0 1 .44-1.06l4.8-4.8A1.5 1.5 0 0 1 8.3 2z"
        fill="currentColor"
      />
      <rect x="9" y="8" width="2" height="8" rx="1" fill={cut} />
      <rect x="13" y="8" width="2" height="8" rx="1" fill={cut} />
    </>
  ),
  reviewing: (
    <>
      <rect x="3" y="2" width="15" height="19" rx="2.5" fill="currentColor" />
      <rect x="6" y="5.5" width="9" height="1.8" rx=".9" fill={cut} />
      <rect x="6" y="9" width="5.5" height="1.8" rx=".9" fill={cut} />
      <circle cx="16" cy="16" r="5" fill={cut} />
      <circle cx="16" cy="16" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m18 18 2.6 2.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // แก้จากต้นฉบับ InitStudio: เพิ่มสถานะ offline (เครื่องไม่ส่งข้อมูล) — วงกลมทึบ + เส้นตัดเฉียงแบบไอคอนเดิม
  offline: (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="9" r="1.4" fill={cut} />
      <path d="m6 6 12 12" stroke={cut} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // แก้จากต้นฉบับ InitStudio: เพิ่มระดับคุณภาพอากาศ 5 ระดับ (หน้ายิ้ม → หน้าบึ้ง → ป้ายเตือน)
  "aq-excellent": (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="8.8" cy="9.8" r="1.3" fill={cut} />
      <circle cx="15.2" cy="9.8" r="1.3" fill={cut} />
      <path d="M7.5 13.2a4.5 4.5 0 0 0 9 0z" fill={cut} />
    </>
  ),
  "aq-good": (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="8.8" cy="9.8" r="1.3" fill={cut} />
      <circle cx="15.2" cy="9.8" r="1.3" fill={cut} />
      <path d="M8.5 14.2a4.2 4.2 0 0 0 7 0" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  "aq-moderate": (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="8.8" cy="9.8" r="1.3" fill={cut} />
      <circle cx="15.2" cy="9.8" r="1.3" fill={cut} />
      <path d="M8.5 15h7" stroke={cut} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  "aq-sensitive": (
    <>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <circle cx="8.8" cy="9.8" r="1.3" fill={cut} />
      <circle cx="15.2" cy="9.8" r="1.3" fill={cut} />
      <path d="M8.5 16.2a4.2 4.2 0 0 1 7 0" fill="none" stroke={cut} strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  "aq-unhealthy": (
    <>
      <path d="M10.3 3.2a2 2 0 0 1 3.4 0l8.2 14.2A2 2 0 0 1 20.2 20.4H3.8a2 2 0 0 1-1.7-3l8.2-14.2z" fill="currentColor" />
      <rect x="11" y="8" width="2" height="6.5" rx="1" fill={cut} />
      <circle cx="12" cy="17.2" r="1.2" fill={cut} />
    </>
  ),
};

export type BadgeStatus = keyof typeof statusIcons;

const tones: Record<BadgeStatus, { light: string; dark: string }> = {
  queued: { light: "#9333ea", dark: "#c084fc" },
  scheduled: { light: "#2563eb", dark: "#60a5fa" },
  progress: { light: "#f97316", dark: "#fb923c" },
  priority: { light: "#e5484d", dark: "#ff6b6b" },
  ready: { light: "#0d9488", dark: "#2dd4bf" },
  waiting: { light: "#c026d3", dark: "#e879f9" },
  paused: { light: "#d97706", dark: "#fbbf24" },
  reviewing: { light: "#0891b2", dark: "#22d3ee" },
  // แก้จากต้นฉบับ InitStudio: สีของสถานะที่เพิ่มใหม่ (สีระดับฝุ่นตามกรมควบคุมมลพิษ)
  offline: { light: "#737373", dark: "#a3a3a3" },
  "aq-excellent": { light: "#55bbfa", dark: "#55bbfa" },
  "aq-good": { light: "#71d64c", dark: "#71d64c" },
  "aq-moderate": { light: "#dbc000", dark: "#dbc000" },
  "aq-sensitive": { light: "#ff9900", dark: "#ff9900" },
  "aq-unhealthy": { light: "#e5484d", dark: "#ff6b6b" },
};

export type StatusBadgeProps = {
  status: BadgeStatus;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const tone = tones[status];
  return (
    <span
      style={{ "--tone-light": tone.light, "--tone-dark": tone.dark } as CSSProperties}
      className={cn(
        "inline-flex min-h-[34px] items-center gap-[7px] whitespace-nowrap rounded-[11px] pl-2.5 pr-[13px] text-[14px] font-semibold leading-none [--badge-cut:#fff] [--tone:var(--tone-light)] home-dark:[--badge-cut:#111] home-dark:[--tone:var(--tone-dark)]",
        "bg-[color-mix(in_srgb,var(--tone)_11%,var(--background))] text-[color-mix(in_srgb,var(--tone)_88%,var(--foreground))] home-dark:bg-[color-mix(in_srgb,var(--tone)_16%,var(--background))] home-dark:text-(--tone)",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] shrink-0 text-(--tone)">
        {statusIcons[status]}
      </svg>
      {children}
    </span>
  );
}

export type CountBadgeProps = {
  count: number;
  max?: number;
  variant?: "default" | "emphasis" | "muted";
  label?: string;
  className?: string;
};

export function CountBadge({ count, max = 99, variant = "default", label, className }: CountBadgeProps) {
  return (
    <span
      // แก้จากต้นฉบับ InitStudio: aria-label เริ่มต้นเป็นภาษาไทย
      aria-label={label ?? `${count} รายการ`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-[5px] text-[12px] font-semibold tabular-nums",
        variant === "default" && "bg-[color-mix(in_srgb,var(--foreground)_8%,var(--background))] text-foreground",
        variant === "emphasis" && "bg-foreground text-background",
        variant === "muted" && "text-foreground/55",
        className,
      )}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
