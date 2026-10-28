import type { Metadata } from "next";
import { About } from "@/components/pages/About";

export const metadata: Metadata = { title: "เกี่ยวกับโครงงาน · PM.Notify" };

export default function Page() {
  return <About />;
}
