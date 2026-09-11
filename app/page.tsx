import StationGrid from "@/components/StationGrid";

/** ลิงก์ทางการของผู้ผลิตชิป CH340 (Nanjing Qinheng / WCH) */
const DRIVERS = [
  {
    os: "Windows",
    href: "https://www.wch-ic.com/downloads/CH341SER_EXE.html",
    note: "แตกไฟล์แล้วเปิด SETUP.EXE กด INSTALL",
  },
  {
    os: "macOS",
    href: "https://www.wch-ic.com/downloads/CH34XSER_MAC_ZIP.html",
    note: "แตกไฟล์แล้วเปิด CH34xVCPDriver.pkg",
  },
];

export default function HomePage() {
  return (
    <div className="wrap">
      <section className="hero">
        <h1>
          {"กิจกรรม : "}
          <span className="accent">นักสำรวจเซนเซอร์</span>
        </h1>
      </section>

      <h2 className="h2">
        แผนที่จุดสำรวจ
      </h2>
      <StationGrid />

      <section className="drivers">
        <h2 className="drivers-h">เสียบบอร์ดแล้วคอมไม่ขึ้นพอร์ต</h2>
        <p className="drivers-p">
          บอร์ดราคาประหยัดส่วนใหญ่ใช้ชิปแปลงสัญญาณรุ่น CH340 ซึ่งต้องลงไดรเวอร์เพิ่มก่อน
          เครื่องจึงจะมองเห็น ลงครั้งเดียวใช้ได้ตลอด แล้วเสียบสายใหม่อีกครั้ง
        </p>
        <div className="drivers-list">
          {DRIVERS.map((d) => (
            <a key={d.os} className="driver" href={d.href} target="_blank" rel="noopener noreferrer">
              <span className="driver-os">ดาวน์โหลดสำหรับ {d.os}</span>
              <span className="driver-note">{d.note}</span>
            </a>
          ))}
        </div>
        <p className="drivers-src">ลิงก์ดาวน์โหลดจากเว็บไซต์ของผู้ผลิตชิปโดยตรง</p>
      </section>
    </div>
  );
}
