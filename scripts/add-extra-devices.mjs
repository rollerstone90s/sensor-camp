/**
 * เติมอุปกรณ์เสริมที่โค้ดชุดใหม่เรียกใช้ลงในตารางต่อสาย
 * (จอแสดงผล / บัซเซอร์ / โมดูลไฟ) โดยอ้างจากรูปผังต่อสายที่ตรวจแล้ว
 * รันครั้งเดียวเพื่อสร้าง data/overrides.json แล้วตามด้วย npm run data
 */
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("data/sensors.json", "utf8"));
const overrides = JSON.parse(fs.readFileSync("data/overrides.json", "utf8"));

const display = () => [
  ["SDA", "A4", "other", "สายข้อมูล", "จอแสดงผล"],
  ["SCL", "A5", "other", "สายจังหวะ", "จอแสดงผล"],
  ["+ / VCC", "5V", "pwr", "จ่ายไฟให้จอ", "จอแสดงผล"],
  ["- / GND", "GND", "gnd", "กราวด์ร่วม", "จอแสดงผล"],
];

const buzzer = (pin) => [
  ["S / OUT", pin, "dig", "ขาสั่งให้ดัง", "บัซเซอร์"],
  ["+ / VCC", "5V", "pwr", "จ่ายไฟ 5 โวลต์", "บัซเซอร์"],
  ["- / GND", "GND", "gnd", "กราวด์ร่วม", "บัซเซอร์"],
];

const led = (pin) => [
  ["S / OUT", pin, "dig", "ขาสั่งให้ติด", "โมดูลไฟ LED"],
  ["+ / VCC", "5V", "pwr", "จ่ายไฟ 5 โวลต์", "โมดูลไฟ LED"],
  ["- / GND", "GND", "gnd", "กราวด์ร่วม", "โมดูลไฟ LED"],
];

/* ตัวที่โค้ดกับรูปตรงกัน เติมได้เลย */
const EXTRA = {
  "03": [display()],
  "04": [display()],
  "06": [display()],
  "07": [display()],
  "08": [display()],
  "10": [display()],
  "12": [led("D9")],
  "14": [led("D9")],
  "15": [buzzer("D8")],
  "16": [buzzer("D8")],
  "18": [led("D9")],
};

for (const [no, groups] of Object.entries(EXTRA)) {
  const sensor = data.sensors.find((s) => s.no === no);
  // ขาเดิมของเซนเซอร์ ติดชื่ออุปกรณ์ให้ครบ จะได้แยกกลุ่มบนหน้าเว็บ
  const own = sensor.pins.map((p) => [p[0], p[1], p[2], p[3], p[4] ?? sensor.th]);
  overrides[no] = { ...(overrides[no] ?? {}), pins: [...own, ...groups.flat()] };
}

fs.writeFileSync("data/overrides.json", JSON.stringify(overrides, null, 2) + "\n");
console.log(`เติมอุปกรณ์เสริมให้ ${Object.keys(EXTRA).length} ตัว: ${Object.keys(EXTRA).join(", ")}`);
