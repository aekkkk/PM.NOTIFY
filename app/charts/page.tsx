import type { Metadata } from "next";
import { Charts } from "@/components/pages/Charts";

export const metadata: Metadata = { title: "กราฟย้อนหลัง · PM.Notify" };

export default function Page() {
  return <Charts />;
}
