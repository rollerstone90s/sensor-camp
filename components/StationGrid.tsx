import Link from "next/link";
import { STATION_IDS, stationGroup, stationSensors } from "@/lib/data";

export default function StationGrid() {
  return (
    <div className="stations">
      {STATION_IDS.map((id) => (
        <Link key={id} href={`/base/${id}`} className={`station-card g-${stationGroup(id)}`}>
          <div className="station-head">
            <span className="station-n">{id}</span>
            <span className="station-lbl">จุดสำรวจที่ {id}</span>
          </div>
          <ul className="station-list">
            {stationSensors(id).map((s) => (
              <li key={s.no}>
                <b>{s.no}</b>
                <span>{s.en}</span>
              </li>
            ))}
          </ul>
        </Link>
      ))}
    </div>
  );
}
