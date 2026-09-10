/**
 * แยกโค้ดจากไฟล์ Word "ปรับโค้ดตามรายการ.docx" ที่แปลงเป็นข้อความแล้ว
 * ไปเก็บเป็น data/code/<เลขเซนเซอร์>.ino
 * รันด้วย: node scripts/import-docx-code.mjs <ไฟล์ข้อความ>
 */
import fs from "node:fs";
import path from "node:path";

/* หัวข้อในเอกสารเรียงไม่ตรงกับเลขเซนเซอร์ของเรา 2 ตัว
   (เอกสารข้อ 16 คือหลอดสามสี = เซนเซอร์ 17 · ข้อ 17 คือตรวจการเคาะ = เซนเซอร์ 16) */
const DOC_TO_SENSOR = {
  1: "01",
  2: "02",
  3: "03",
  4: "04",
  5: "05",
  6: "06",
  7: "07",
  8: "08",
  9: "09",
  10: "10",
  11: "11",
  12: "12",
  13: "13",
  14: "14",
  15: "15",
  16: "17",
  17: "16",
  18: "18",
};

/* Word ชอบแปลงเครื่องหมายคำพูดเป็นตัวเอียง ซึ่งคอมไพล์ไม่ผ่าน ต้องดัดกลับ */
function normalize(code) {
  return code
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”‟]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/ /g, " ")
    .replace(/\r/g, "");
}

const source = process.argv[2];
if (!source) {
  console.error("ต้องบอกไฟล์ข้อความที่แปลงจาก .docx มาด้วย");
  process.exit(1);
}

const lines = fs.readFileSync(source, "utf8").split("\n");
const heads = [];
lines.forEach((line, i) => {
  const m = line.match(/^(\d{1,2})\s*\.\s*\S/);
  if (m) heads.push({ docNo: Number(m[1]), at: i, title: line.trim() });
});

fs.mkdirSync(path.join("data", "code"), { recursive: true });

const report = [];
heads.forEach((h, i) => {
  const no = DOC_TO_SENSOR[h.docNo];
  if (!no) {
    report.push(`ข้าม ${h.title} (ไม่รู้ว่าตรงกับเซนเซอร์ตัวไหน)`);
    return;
  }
  const end = i + 1 < heads.length ? heads[i + 1].at : lines.length;
  const code = normalize(lines.slice(h.at + 1, end).join("\n")).trim() + "\n";
  fs.writeFileSync(path.join("data", "code", `${no}.ino`), code);
  report.push(`${h.title} -> data/code/${no}.ino (${code.split("\n").length} บรรทัด)`);
});

console.log(report.join("\n"));
