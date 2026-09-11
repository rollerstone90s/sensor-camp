import StationGrid from "@/components/StationGrid";

/** หน้ารวมไดรเวอร์ CH340 ทุกระบบปฏิบัติการ ฉบับแปลไทย */
const DRIVER_URL =
  "https://sparks-gogo-co-nz.translate.goog/ch340.html?_x_tr_sl=en&_x_tr_tl=th&_x_tr_hl=th&_x_tr_pto=tc";

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
        <a className="driver" href={DRIVER_URL} target="_blank" rel="noopener noreferrer">
          <span className="driver-os">ดาวน์โหลดไดรเวอร์ CH340</span>
          <span className="driver-note">ใช้ได้ทั้ง Windows และ macOS</span>
        </a>
        <p className="drivers-src">ในหน้านี้เลือกไฟล์ตามระบบปฏิบัติการของเครื่อง พร้อมวิธีติดตั้ง</p>
      </section>
    </div>
  );
}
