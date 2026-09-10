"use client";

import { useCallback, useEffect, useState } from "react";
import { STATION_IDS, stationTitle } from "@/lib/data";

type Card = { id: number; url: string; svg: string };

/** ทำที่อยู่เว็บให้อยู่ในรูปที่มือถือสแกนแล้วเปิดได้จริง */
function normalize(input: string): { base: string; hostname: string } | { error: string } {
  let base = input.trim().replace(/#.*$/, "");
  if (!base) return { error: "ใส่ที่อยู่เว็บก่อน เช่น https://sensorcamp.netlify.app/" };
  if (/^file:/i.test(base))
    return { error: "ที่อยู่นี้เป็นไฟล์ในเครื่อง มือถือสแกนแล้วเปิดไม่ได้ ต้องอัปเว็บขึ้นออนไลน์ก่อน" };
  if (!/^https?:\/\//i.test(base)) base = "https://" + base;

  let u: URL;
  try {
    u = new URL(base);
  } catch {
    return { error: "ที่อยู่ดูไม่ถูกต้อง ต้องเป็นแบบ https://ชื่อเว็บ.netlify.app/ หรือ http://192.168.1.23:3000/" };
  }
  const host = u.hostname;
  const ok = host.includes(".") || host === "localhost";
  if (!ok) return { error: "ที่อยู่ดูไม่ถูกต้อง ต้องมีชื่อโดเมนหรือเลข IP เช่น http://192.168.1.23:3000/" };

  base = u.origin + u.pathname;
  if (!base.endsWith("/")) base += "/";
  return { base, hostname: host };
}

const isLoopback = (host: string) => host === "localhost" || /^127\./.test(host) || host === "::1";

export default function PrintSheet() {
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [local, setLocal] = useState(false);

  const make = useCallback(async (value: string) => {
    const res = normalize(value);
    if ("error" in res) {
      setCards([]);
      setMsg(res.error);
      return;
    }
    setUrl(res.base);
    try {
      const QRCode = (await import("qrcode")).default;
      const made = await Promise.all(
        STATION_IDS.map(async (id) => {
          const link = `${res.base}base/${id}/`;
          const svg = await QRCode.toString(link, {
            type: "svg",
            margin: 0,
            errorCorrectionLevel: "M",
          });
          return { id, url: link, svg };
        }),
      );
      setCards(made);
      setMsg(
        isLoopback(res.hostname)
          ? `สร้างแล้ว ${made.length} ใบ แต่ที่อยู่นี้เป็นเครื่องตัวเอง มือถือเปิดไม่ได้ · ให้เปลี่ยนเป็นเลข IP ของเครื่องในวง Wi-Fi เดียวกัน เช่น http://192.168.1.23:3000/ (ดูได้จากบรรทัด Network: ตอนสั่ง npm run dev)`
          : `สร้างแล้ว ${made.length} ใบ · ก่อนพิมพ์จริง ลองสแกนสัก 2 ใบด้วยมือถือก่อน`,
      );
    } catch {
      setMsg("สร้าง QR ไม่สำเร็จ ลองรีเฟรชหน้าอีกครั้ง");
    }
  }, []);

  // เปิดจากเซิร์ฟเวอร์จริง ก็เดาที่อยู่ให้แล้วสร้าง QR ให้เลยตั้งแต่แรก
  useEffect(() => {
    const isFile = location.protocol === "file:";
    setLocal(isFile);
    if (!isFile) make(location.origin + "/");
  }, [make]);

  return (
    <div className="wrap">
      <section className="station-hero no-print">
        <p className="eyebrow">สำหรับครูผู้จัดกิจกรรม</p>
        <h1>ป้าย QR ประจำจุดสำรวจ</h1>
        <p className="sub">ใส่ที่อยู่เว็บที่อัปโหลดจริง แล้วสั่งพิมพ์หน้านี้ไปติดที่โต๊ะแต่ละจุด</p>

        {local && (
          <div className="warn" style={{ marginTop: 16 }}>
            <b>ตอนนี้เปิดจากไฟล์ในเครื่อง</b>
            QR ต้องชี้ไปที่เว็บที่ขึ้นออนไลน์แล้วเท่านั้น มือถือของเด็กจึงจะเปิดได้ ให้อัปขึ้น Netlify ก่อน
            แล้วเอาที่อยู่นั้นมากรอกช่องข้างล่าง
          </div>
        )}

        <div className="field">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") make(url);
            }}
            placeholder="https://sensorcamp.netlify.app/"
            aria-label="ที่อยู่เว็บที่อัปโหลดจริง"
          />
          <button className="btn btn-primary" onClick={() => make(url)}>
            สร้าง QR
          </button>
          <button className="btn" onClick={() => window.print()} disabled={cards.length === 0}>
            พิมพ์
          </button>
        </div>
        <p style={{ color: "var(--ink-3)", fontSize: 14, margin: "6px 0 0" }}>{msg}</p>
      </section>

      <div className="qr-grid">
        {cards.map((c) => (
          <div className="qr-card" key={c.id}>
            <p className="qr-b">จุดสำรวจที่ {c.id}</p>
            <p className="qr-s">{stationTitle(c.id)}</p>
            <div dangerouslySetInnerHTML={{ __html: c.svg }} />
            <p className="qr-u">{c.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
