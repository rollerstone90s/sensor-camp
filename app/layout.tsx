import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Thai, Kanit } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const sansThai = IBM_Plex_Sans_Thai({
  variable: "--font-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* Kanit เป็นฟอนต์ที่ออกแบบมาสำหรับภาษาไทยโดยเฉพาะ หัวกลมอ่านง่ายกว่าฟอนต์เหลี่ยม
   และมีน้ำหนักครบ เหมาะกับหัวข้อที่ต้องอ่านจากไกล */
const display = Kanit({
  variable: "--font-display",
  subsets: ["thai", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "นักสำรวจเซนเซอร์ · ภารกิจ 9 จุดสำรวจ",
  description:
    "กิจกรรมนักสำรวจเซนเซอร์ เดินครบ 9 จุดสำรวจ ทดลองเซนเซอร์ 18 ชนิด พร้อมโค้ด Arduino ที่คัดลอกไปใช้ได้ทันที",
};

export const viewport: Viewport = {
  themeColor: "#0e4f4a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sansThai.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
