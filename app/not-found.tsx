import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <section className="station-hero">
        <p className="eyebrow">หลงทาง</p>
        <h1>ไม่พบหน้านี้</h1>
        <p className="sub">
          จุดสำรวจมีเลข 1 ถึง 9 เท่านั้น ลองกลับไปเลือกจากแผนที่ หรือสแกน QR ที่โต๊ะอีกครั้ง
        </p>
        <div className="hero-cta" style={{ marginTop: 20 }}>
          <Link className="btn btn-primary" href="/">
            กลับหน้าแผนที่
          </Link>
        </div>
      </section>
    </div>
  );
}
