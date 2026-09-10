import Link from "next/link";
import { CompassIcon } from "@/components/Icons";

export default function SiteHeader() {
  return (
    <header className="top">
      <div className="top-in">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <CompassIcon size={20} />
          </span>
          <span>
            <span className="brand-name">นักสำรวจเซนเซอร์</span>
            <span className="brand-sub">Sensor Explorer</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
