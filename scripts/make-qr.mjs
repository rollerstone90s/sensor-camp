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
          ${st.sensors.map((s) => `<li><b>${s.no}</b><span>${esc(s.en)}</span></li>`).join("")}
        </ul>
        <p class="call">สแกน QR เพื่อดูผังการต่อสายและโค้ดของจุดนี้</p>
      </div>
      <div class="right">
        <img src="${dataUri}" alt="QR จุดสำรวจที่ ${st.id}">
        <p class="url">${esc(st.url)}</p>
      </div>
    </section>`);
}

/* วางป้าย A5 สองใบต่อกระดาษ A4 หนึ่งแผ่น ปริ้นเสร็จตัดครึ่งกลางได้เลย */
const pages = [];
for (let i = 0; i < sheets.length; i += 2) {
  const second = sheets[i + 1] ?? '<section class="sheet blank"></section>';
  pages.push(`<div class="page">${sheets[i]}${second}</div>`);
}

const html = `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>ป้าย QR ประจำจุดสำรวจ · นักสำรวจเซนเซอร์</title>
<style>
  /* กระดาษ A4 แนวตั้ง หนึ่งแผ่นวางป้าย A5 แนวนอนสองใบ ตัดครึ่งกลางได้ */
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e9e6df; }
  body {
    font-family: "IBM Plex Sans Thai", "Sarabun", system-ui, sans-serif;
    color: #17211f;
  }
  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    margin: 0 auto 6mm;
    background: #fff;
    display: grid;
    grid-template-rows: 1fr 1fr;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }
  /* เส้นประกลางหน้าไว้เล็งตอนตัด */
  .page::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    border-top: 1px dashed #c2bcae;
  }
  .sheet {
    position: relative;
    height: 148.5mm;
    padding: 12mm 13mm 11mm 17mm;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10mm;
    align-items: center;
    overflow: hidden;
  }
  .sheet.blank { background: #fff; }
  /* แถบสีประจำหมวดที่ขอบซ้าย ช่วยให้ครูหยิบป้ายถูกจุดเร็วขึ้น */
  .sheet::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 7mm;
    background: var(--accent);
  }
  .sheet.blank::before { display: none; }
  .eyebrow {
    margin: 0 0 3mm;
    font-size: 11pt;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #7f8b86;
  }
  .no {
    margin: 0 0 5mm;
    font-size: 31pt;
    font-weight: 700;
    line-height: 1.2;
  }
  .no .num {
    color: var(--accent);
    font-size: 42pt;
  }
  .list { list-style: none; margin: 0 0 6mm; padding: 0; display: grid; gap: 2.5mm; }
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
  .right img { width: 68mm; height: 68mm; display: block; }
  .url {
    margin: 2.5mm 0 0;
    font-family: ui-monospace, monospace;
    font-size: 7.5pt;
    color: #8a938f;
    word-break: break-all;
    max-width: 68mm;
  }
  @media print {
    html, body { background: #fff; }
    .page { margin: 0; box-shadow: none; }
  }
  @media screen {
    body { padding: 6mm 0; }
    .page { box-shadow: 0 2px 12px rgba(0,0,0,.12); }
  }
</style>
</head>
<body>
${pages.join("")}
</body>
</html>`;

fs.writeFileSync(path.join(outDir, "print-qr.html"), html);

console.log(`สร้าง QR ${stations.length} ใบ ที่โฟลเดอร์ ${outDir}/`);
console.log(`  ภาพแยกใบ : station-1.png ถึง station-${stations.length}.png (1200 px)`);
console.log(`  หน้าพิมพ์ : ${outDir}/print-qr.html (A4 แนวตั้ง แผ่นละ 2 ป้าย รวม ${pages.length} แผ่น)`);
console.log(`  ชี้ไปที่   : ${base}base/1/ ... ${base}base/${stations.length}/`);
