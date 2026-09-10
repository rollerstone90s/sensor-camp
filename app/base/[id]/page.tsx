import Link from "next/link";
import { notFound } from "next/navigation";
import SensorCard from "@/components/SensorCard";
import { STATION_IDS, stationGroup, stationSensors, stationTitle } from "@/lib/data";

export function generateStaticParams() {
  return STATION_IDS.map((id) => ({ id: String(id) }));
}

export async function generateMetadata({ params }: PageProps<"/base/[id]">) {
  const { id } = await params;
  const n = Number(id);
  if (!STATION_IDS.includes(n)) return { title: "ไม่พบจุดสำรวจ" };
  return {
    title: `จุดสำรวจที่ ${n} · ${stationTitle(n)}`,
    description: `ผังการต่อสายและโค้ด Arduino ของจุดสำรวจที่ ${n}`,
  };
}

export default async function StationPage({ params }: PageProps<"/base/[id]">) {
  const { id } = await params;
  const n = Number(id);
  if (!STATION_IDS.includes(n)) notFound();

  const group = stationGroup(n);
  const sensors = stationSensors(n);
  const first = STATION_IDS[0];
  const last = STATION_IDS[STATION_IDS.length - 1];

  return (
    <div className={`wrap g-${group}`}>
      <section className="station-hero">
        <h1>จุดสำรวจที่ {n}</h1>
      </section>

      {sensors.map((s) => (
        <SensorCard key={s.no} sensor={s} />
      ))}

      <nav className="nav">
        {n > first ? (
          <Link className="btn" href={`/base/${n - 1}`}>
            ← จุดสำรวจที่ {n - 1}
          </Link>
        ) : (
          <Link className="btn" href="/">
            ← กลับหน้าแผนที่
          </Link>
        )}
        {n < last ? (
          <Link className="btn" href={`/base/${n + 1}`}>
            จุดสำรวจที่ {n + 1} →
          </Link>
        ) : (
          <Link className="btn" href="/">
            กลับหน้าแผนที่ →
          </Link>
        )}
      </nav>
    </div>
  );
}
