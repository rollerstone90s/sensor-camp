import type { Metadata } from "next";
import PrintSheet from "@/components/PrintSheet";

export const metadata: Metadata = {
  title: "ป้าย QR ประจำจุดสำรวจ · สำหรับครู",
  description: "สร้างและพิมพ์ป้าย QR ของทั้ง 9 จุดสำรวจ",
};

export default function PrintPage() {
  return <PrintSheet />;
}
