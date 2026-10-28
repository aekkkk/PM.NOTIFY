import type { Metadata } from "next";
import { Knowledge } from "@/components/pages/Knowledge";

export const metadata: Metadata = { title: "ความรู้เรื่องฝุ่น · PM.Notify" };

export default function Page() {
  return <Knowledge />;
}
