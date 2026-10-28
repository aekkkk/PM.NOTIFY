import type { Metadata, Viewport } from "next";
import { Anuphan, Geist } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { DataProvider } from "@/components/DataProvider";
import { ToastStackProvider } from "@/components/ui/ToastStack";
import { themeScript } from "@/lib/theme";
import "./globals.css";

// ฟอนต์ชุดเดียวกับ InitStudio: Geist (อังกฤษ/ตัวเลข) + Anuphan (ภาษาไทย)
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const anuphan = Anuphan({ variable: "--font-anuphan", subsets: ["thai", "latin"] });

export const metadata: Metadata = {
  title: "PM.Notify — ระบบตรวจวัดคุณภาพอากาศอัจฉริยะ",
  description: "แดชบอร์ดแสดงค่าฝุ่น PM2.5 อุณหภูมิ และความชื้นจากเครื่อง PM.Notify โครงงาน IoT ชั้น ม.2",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: สคริปต์ธีมเปลี่ยน data-home-theme ก่อน React เริ่มทำงาน
    <html lang="th" data-home-theme="light" suppressHydrationWarning className={`${geist.variable} ${anuphan.variable} h-full antialiased`}>
      <head>
        {/* ตั้งธีมก่อนหน้าเว็บแสดง กันจอกะพริบ */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <ToastStackProvider>
          <DataProvider>
            <AppShell>{children}</AppShell>
          </DataProvider>
        </ToastStackProvider>
      </body>
    </html>
  );
}
