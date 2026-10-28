import type { Metadata } from "next";
import { History } from "@/components/pages/History";

export const metadata: Metadata = { title: "ประวัติการแจ้งเตือน · PM.Notify" };

export default function Page() {
  return <History />;
}
