import StationGrid from "@/components/StationGrid";

/** หน้ารวมไดรเวอร์ CH340 ฝั่ง Windows เป็นฉบับแปลไทย */
const DRIVERS = [
  {
    os: "Windows",
    href: "https://sparks-gogo-co-nz.translate.goog/ch340.html?_x_tr_sl=en&_x_tr_tl=th&_x_tr_hl=th&_x_tr_pto=tc",
    note: "หน้าแปลไทย เลือกไฟล์หัวข้อ Windows",
  },
  {
    os: "macOS",
    href: "https://sparks.gogo.co.nz/ch340.html?srsltid=AfmBOoqLPlPbpom3UtI44_BMB_zlhH-LidgxEAML0bHjPrA1BIlSBXCk",
    note: "เลือกไฟล์หัวข้อ macOS ในหน้านี้",
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
        <p className="drivers-src">หน้ารวมไดรเวอร์ CH340 พร้อมวิธีติดตั้งทุกระบบปฏิบัติการ</p>
      </section>
    </div>
  );
}
