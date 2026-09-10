/**
 * สร้าง QR ของทุกจุดสำรวจเป็นไฟล์ภาพ พร้อมหน้ารวมสำหรับสั่งพิมพ์
 * รันด้วย: npm run qr -- https://sensorcamp.netlify.app/
 */
import fs from "node:fs";
import path from "node:path";
import QRCode from "qrcode";

const data = JSON.parse(fs.readFileSync("data/sensors.json", "utf8"));
const base = (process.argv[2] ?? "https://sensorcamp.netlify.app/").replace(/\/?$/, "/");
const outDir = "qr";

fs.mkdirSync(outDir, { recursive: true });

const stations = Object.keys(data.bases)
  .map(Number)
  .sort((a, b) => a - b)
  .map((id) => ({
    id,
    url: `${base}base/${id}/`,
    sensors: data.bases[String(id)].map((no) => data.sensors.find((s) => s.no === no)),
  }));

const esc = (t) => t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

const GROUP_COLOR = { med: "#a8384c", agr: "#2e7a52", eng: "#1d5c9e", saf: "#bf6017" };

const sheets = [];
for (const st of stations) {
  // ไฟล์ภาพแยกใบ เผื่อเอาไปวางในโปสเตอร์หรือสไลด์เอง
  await QRCode.toFile(path.join(outDir, `station-${st.id}.png`), st.url, {
    width: 1200,
    margin: 2,
    errorCorrectionLevel: "M",
  });
  // ฝังลงหน้าพิมพ์เป็น data URI จะได้เปิดไฟล์เดียวจบ ไม่ต้องพกโฟลเดอร์รูป
  const dataUri = await QRCode.toDataURL(st.url, { width: 900, margin: 1, errorCorrectionLevel: "M" });
  const color = GROUP_COLOR[data.baseGroup[String(st.id)]] ?? "#0e4f4a";

  sheets.push(`
    <section class="sheet" style="--accent:${color}">
      <div class="left">
        <p class="eyebrow">กิจกรรมนักสำรวจเซนเซอร์</p>
        <h1 class="no">จุดสำรวจที่ <span class="num">${st.id}</span></h1>
        <ul class="list">
          ${st.sensors.map((s) => `<li><b>${s.no}</b><span>${esc(s.th)}</span></li>`).join("")}
        </ul>
        <p class="call">สแกน QR เพื่อดูผังการต่อสายและโค้ดของจุดนี้</p>
      </div>
      <div class="right">
        <img src="${dataUri}" alt="QR จุดสำรวจที่ ${st.id}">
        <p class="url">${esc(st.url)}</p>
      </div>
    </section>`);
}

const html = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>ป้าย QR ประจำจุดสำรวจ · นักสำรวจเซนเซอร์</title>
<style>
  /* A5 แนวนอน หนึ่งจุดสำรวจต่อหนึ่งแผ่น */
  @page { size: A5 landscape; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e9e6df; }
  body {
    font-family: "IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif;
    color: #17211f;
  }
  .sheet {
    position: relative;
    width: 210mm;
    height: 148mm;
    margin: 0 auto 6mm;
    padding: 14mm 14mm 12mm 18mm;
    background: #fff;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12mm;
    align-items: center;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .sheet:last-child { page-break-after: auto; break-after: auto; }
  /* แถบสีประจำหมวดที่ขอบซ้าย ช่วยให้ครูหยิบป้ายถูกจุดเร็วขึ้น */
  .sheet::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 8mm;
    background: var(--accent);
  }
  .eyebrow {
    margin: 0 0 3mm;
    font-size: 11pt;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #7f8b86;
  }
  .no {
    margin: 0 0 6mm;
    font-size: 34pt;
    font-weight: 700;
    line-height: 1.2;
  }
  .no .num {
    color: var(--accent);
    font-size: 46pt;
  }
  .list { list-style: none; margin: 0 0 7mm; padding: 0; display: grid; gap: 2.5mm; }
  .list li { display: flex; align-items: baseline; gap: 3mm; font-size: 15pt; line-height: 1.5; }
  .list b {
    font-family: ui-monospace, monospace;
    font-size: 11pt;
    color: #fff;
    background: var(--accent);
    border-radius: 3px;
    padding: 0.5mm 2mm;
  }
  .call { margin: 0; font-size: 12pt; color: #4d5a56; }
  .right { text-align: center; }
  .right img { width: 76mm; height: 76mm; display: block; }
  .url {
    margin: 2.5mm 0 0;
    font-family: ui-monospace, monospace;
    font-size: 7.5pt;
    color: #8a938f;
    word-break: break-all;
    max-width: 76mm;
  }
  @media print {
    html, body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; }
  }
  @media screen {
    body { padding: 6mm 0; }
    .sheet { box-shadow: 0 2px 12px rgba(0,0,0,.12); }
  }
</style>
</head>
<body>
${sheets.join("")}
</body>
</html>`;

fs.writeFileSync(path.join(outDir, "print-qr.html"), html);

console.log(`สร้าง QR ${stations.length} ใบ ที่โฟลเดอร์ ${outDir}/`);
console.log(`  ภาพแยกใบ : station-1.png ถึง station-${stations.length}.png (1200 px)`);
console.log(`  หน้าพิมพ์ : ${outDir}/print-qr.html (A5 แนวนอน จุดละ 1 แผ่น)`);
console.log(`  ชี้ไปที่   : ${base}base/1/ ... ${base}base/${stations.length}/`);
