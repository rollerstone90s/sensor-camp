/**
 * สลับเลขประจำตัวเซนเซอร์สองตัว โดยไม่ย้ายเซนเซอร์ข้ามจุดสำรวจ
 * รันด้วย: node scripts/swap-numbers.mjs 08 10
 *
 * เลขผูกอยู่กับ 4 ที่ ต้องย้ายให้ครบพร้อมกัน
 *   legacy/data.raw.json (ช่อง no) · data/code/NN.ino · public/wiring/NN.webp · data/overrides.json
 */
import fs from "node:fs";
import path from "node:path";

const [a, b] = process.argv.slice(2);
if (!/^\d\d$/.test(a ?? "") || !/^\d\d$/.test(b ?? "")) {
  console.error("ต้องบอกเลขสองตัว เช่น: node scripts/swap-numbers.mjs 08 10");
  process.exit(1);
}

/** สลับไฟล์คู่หนึ่ง ต้องพักไว้ที่ชื่อชั่วคราวก่อน ไม่งั้นทับกันเอง */
function swapFiles(dir, ext) {
  const fa = path.join(dir, `${a}${ext}`);
  const fb = path.join(dir, `${b}${ext}`);
  for (const f of [fa, fb]) if (!fs.existsSync(f)) throw new Error(`ไม่พบไฟล์ ${f}`);
  const hold = path.join(dir, `__tmp${ext}`);
  fs.renameSync(fa, hold);
  fs.renameSync(fb, fa);
  fs.renameSync(hold, fb);
}

swapFiles(path.join("data", "code"), ".ino");
swapFiles(path.join("public", "wiring"), ".webp");

const swap = (no) => (no === a ? b : no === b ? a : no);

/* ข้อมูลต้นทาง */
const rawPath = path.join("legacy", "data.raw.json");
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
for (const s of raw.sensors) s.no = swap(s.no);
raw.sensors.sort((x, y) => x.no.localeCompare(y.no));
fs.writeFileSync(rawPath, JSON.stringify(raw, null, 2));

/* ของที่แก้ทับรายตัว รวมถึงรายชื่อเซนเซอร์ประจำจุดสำรวจ */
const ovPath = path.join("data", "overrides.json");
const ov = JSON.parse(fs.readFileSync(ovPath, "utf8"));

const ha = ov[a];
const hb = ov[b];
if (hb) ov[a] = hb;
else delete ov[a];
if (ha) ov[b] = ha;
else delete ov[b];

if (ov._bases) {
  for (const [id, list] of Object.entries(ov._bases)) {
    // สลับเลขแล้วเรียงในจุดสำรวจให้เลขน้อยขึ้นก่อน
    ov._bases[id] = list.map(swap).sort();
  }
}

const sorted = {};
for (const k of Object.keys(ov).filter((k) => /^\d\d$/.test(k)).sort()) sorted[k] = ov[k];
for (const k of Object.keys(ov).filter((k) => !/^\d\d$/.test(k))) sorted[k] = ov[k];
fs.writeFileSync(ovPath, JSON.stringify(sorted, null, 2) + "\n");

console.log(`สลับเลข ${a} กับ ${b} แล้ว (เซนเซอร์ยังอยู่จุดสำรวจเดิม)`);
