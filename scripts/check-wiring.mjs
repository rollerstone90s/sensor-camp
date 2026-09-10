/**
 * ตรวจว่าตารางต่อสายเขียนครบไหม
 *  - ทุกขาที่โค้ดเรียกใช้ ต้องมีอยู่ในตาราง
 *  - ทุกอุปกรณ์ในตาราง ต้องมีทั้งขาไฟและขากราวด์
 * รันด้วย: npm run check-wiring
 */
import fs from "node:fs";

const { sensors } = JSON.parse(fs.readFileSync("data/sensors.json", "utf8"));

/** ขาที่โค้ดใช้จริง (เฉพาะบรรทัดที่ไม่ใช่คอมเมนต์) */
function pinsInCode(code) {
  const active = code
    .split("\n")
    .filter((l) => !/^\s*\/\//.test(l))
    .join("\n");

  // ชื่อตัวแปรที่หมายถึงขาจริง ๆ ไม่ใช่ค่าเกณฑ์อย่าง AMP_MIN หรือ TIMEOUT
  const PIN_NAME =
    /^(pin|led|buzzer|trig|echo|clk|dt|sw|button|btn|laser|receiver|recv|flame|tap|reed|shock|relay|dht|r|g|b)(_|$)|_(pin|led|buzzer|relay|button|btn|shock|reed|tap|recv|ao|do)$/i;

  const used = new Set();
  for (const m of active.matchAll(/(?:const\s+int|#define)\s+(\w+)\s*=?\s*(A[0-5]|\d{1,2})\b/g)) {
    if (PIN_NAME.test(m[1])) used.add(m[2]);
  }
  // ประกาศหลายตัวในบรรทัดเดียว เช่น const int R = 9, G = 10, B = 11;
  for (const m of active.matchAll(/const\s+int\s+([^;]+);/g)) {
    for (const part of m[1].split(",")) {
      const [name, v] = part.split("=").map((x) => (x ?? "").trim());
      if (v && PIN_NAME.test(name) && /^(A[0-5]|\d{1,2})$/.test(v)) used.add(v);
    }
  }
  if (/LiquidCrystal_I2C/.test(active)) {
    used.add("A4");
    used.add("A5");
  }
  return used;
}

const norm = (p) => p.replace(/^D/, "");
const problems = [];

for (const s of sensors) {
  const inTable = new Set(
    s.pins.flatMap((p) => p[1].split("/").map((x) => norm(x.trim()))).filter((x) => x && x !== "โหลด"),
  );
  const used = pinsInCode(s.code);

  const missing = [...used].filter((pin) => !inTable.has(norm(pin)) && pin !== "13");
  if (missing.length) problems.push(`${s.no} ${s.th}: โค้ดใช้ขา ${missing.join(", ")} แต่ตารางไม่มี`);

  // อุปกรณ์แต่ละตัวต้องมีไฟและกราวด์ (ยกเว้นหลอดสามสีที่ใช้ขาสัญญาณเป็นตัวจ่ายไฟ)
  const byDevice = new Map();
  for (const p of s.pins) {
    const dev = p[4] ?? s.th;
    if (!byDevice.has(dev)) byDevice.set(dev, []);
    byDevice.get(dev).push(p);
  }
  for (const [dev, rows] of byDevice) {
    if (s.no === "17") continue;
    if (!rows.some((r) => r[2] === "pwr")) problems.push(`${s.no} ${dev}: ไม่มีขาไฟ`);
    if (!rows.some((r) => r[2] === "gnd")) problems.push(`${s.no} ${dev}: ไม่มีขากราวด์`);
  }
}

console.log(problems.length ? "พบจุดที่ยังไม่ครบ:\n" + problems.join("\n") : "ตารางต่อสายครบทุกตัว");
