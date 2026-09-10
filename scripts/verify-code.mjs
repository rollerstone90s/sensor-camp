/** ตรวจว่าการล้างชื่อรุ่นไม่ได้ไปแตะตัวคำสั่งของโค้ด Arduino เลย */
import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("legacy/data.raw.json", "utf8"));
const out = JSON.parse(fs.readFileSync("data/sensors.json", "utf8"));

const stripComments = (code) =>
  code
    .split("\n")
    .map((line) => {
      const i = line.indexOf("//");
      if (i < 0) return line;
      const before = line.slice(0, i);
      const quotes = (before.match(/(?<!\\)"/g) ?? []).length;
      return quotes % 2 === 1 ? line : before;
    })
    // ตัดบรรทัดว่างทิ้ง เพราะการลบคอมเมนต์หัวไฟล์ทำให้จำนวนบรรทัดว่างไม่เท่ากัน
    .filter((line) => line.trim() !== "")
    .join("\n");

let diff = 0;
const skipped = [];
for (const a of raw.sensors) {
  const b = out.sensors.find((x) => x.no === a.no);
  // ตัวที่ใส่โค้ดชุดใหม่ทับ ไม่ต้องเทียบกับของเดิม
  if (fs.existsSync(`data/code/${a.no}.ino`)) {
    skipped.push(a.no);
    continue;
  }
  if (stripComments(a.code) !== stripComments(b.code)) {
    console.log("ตัวคำสั่งต่างกันที่", a.no, "code");
    diff++;
  }
  for (const v of ["fun", "lcd"]) {
    if (a[v] && stripComments(a[v].code) !== stripComments(b[v].code)) {
      console.log("ตัวคำสั่งต่างกันที่", a.no, v);
      diff++;
    }
  }
}

console.log(diff ? `พบความต่าง ${diff} จุด` : "ตัวคำสั่งทุกบรรทัดเหมือนต้นฉบับเป๊ะ แก้เฉพาะคอมเมนต์");
if (skipped.length) console.log(`ข้ามตัวที่ใส่โค้ดชุดใหม่ทับ: ${skipped.join(", ")}`);
