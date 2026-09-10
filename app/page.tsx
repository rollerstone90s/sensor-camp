import StationGrid from "@/components/StationGrid";

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
    </div>
  );
}
