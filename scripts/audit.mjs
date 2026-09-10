/**
 * ไล่ตรวจความถูกต้องของทุกเซนเซอร์ในคราวเดียว
 * รันด้วย: npm run audit
 */
import fs from "node:fs";

const { sensors } = JSON.parse(fs.readFileSync("data/sensors.json", "utf8"));
const problems = [];
const note = (no, msg) => problems.push(`${no}: ${msg}`);

/* คำที่ต้องปรากฏในโค้ดของเซนเซอร์แต่ละตัว ถ้าไม่มีแปลว่าน่าจะใส่โค้ดผิดตัว */
const EXPECT = {
  "01": /PIN_PULSE|bpm/i,
  "02": /pms|PM2/i,
  "03": /dht/i,
  "04": /PIN_LDR|Light/i,
  "05": /PIN_RELAY/i,
  "06": /CLK|encoder/i,
  "07": /PIN_IR|Line/i,
  "08": /TRIG|ECHO/i,
  "09": /LASER/i,
  "10": /PIN_HALL|Magnet/i,
  "11": /FLAME/i,
  "12": /PIN_SHOCK/i,
  "13": /PIN_D|clap|ปรบมือ/i,
  "14": /PIN_A|peak/i,
  "15": /PIN_REED/i,
  "16": /PIN_TAP/i,
  "17": /analogWrite/i,
  "18": /BUTTON/i,
};

const codes = new Map();
for (const s of sensors) {
  const code = s.code;

  // 1. โค้ดต้องเป็นของเซนเซอร์ตัวนั้นจริง
  if (!EXPECT[s.no].test(code)) note(s.no, `โค้ดไม่มีคำที่ควรมีของ ${s.th} — อาจใส่ผิดตัว`);

  // 2. ต้องไม่มีไฟล์ไหนซ้ำกับไฟล์อื่น
  const key = code.replace(/\s+/g, " ").trim();
  if (codes.has(key)) note(s.no, `โค้ดซ้ำกับเซนเซอร์ ${codes.get(key)} ทุกบรรทัด`);
  else codes.set(key, s.no);

  // 3. ข้อความที่ขึ้นจอต้องไม่ใช่ของเซนเซอร์ตัวอื่น
  const screen = [...code.matchAll(/lcd\.print\("([^"]*)"\)/g)].map((m) => m[1]).join(" ");
  const WRONG_SCREEN = [
    [/IR Line|White Surface|Black Surface/i, "07"],
    [/Magnet|Hall/i, "10"],
    [/BPM|Place finger/i, "01"],
    [/PM2\.5|Air:/i, "02"],
    [/Parking|Dist /i, "08"],
    [/Encoder|Position/i, "06"],
    [/Weather|Temp |Humi /i, "03"],
    [/Light|Status: /i, "04"],
  ];
  for (const [rx, owner] of WRONG_SCREEN) {
    if (rx.test(screen) && owner !== s.no) note(s.no, `ข้อความบนจอเป็นของเซนเซอร์ ${owner}`);
  }

  // 4. โค้ดใช้จอ แต่ตารางไม่มีจอ (หรือกลับกัน)
  const usesLcd = /LiquidCrystal_I2C/.test(code);
  const tableLcd = s.pins.some((p) => p[4] === "จอแสดงผล");
  if (usesLcd && !tableLcd) note(s.no, "โค้ดใช้จอแสดงผล แต่ตารางต่อสายไม่มีจอ");
  if (!usesLcd && tableLcd) note(s.no, "ตารางมีจอแสดงผล แต่โค้ดไม่ได้ใช้จอ");

  // 5. โค้ดใช้บัซเซอร์ แต่ตารางไม่มี (หรือกลับกัน)
  const usesBuzzer = /tone\(/.test(code);
  const tableBuzzer = s.pins.some((p) => p[4] === "บัซเซอร์");
  if (usesBuzzer && !tableBuzzer) note(s.no, "โค้ดมีเสียงบัซเซอร์ แต่ตารางต่อสายไม่มีบัซเซอร์");
  if (!usesBuzzer && tableBuzzer) note(s.no, "ตารางมีบัซเซอร์ แต่โค้ดไม่ได้ใช้");

  // 6. เนื้อหาต้องเขียนครบทุกช่อง
  for (const f of ["how", "result", "next", "job", "en"]) {
    if (!s[f] || String(s[f]).trim().length < 10) note(s.no, `ช่อง ${f} ว่างหรือสั้นผิดปกติ`);
  }
  if (!Array.isArray(s.steps) || s.steps.length < 3) note(s.no, "วิธีการทดลองน้อยกว่า 3 ขั้นตอน");

  // 7. ต้องมีรูปผังการต่อสาย
  if (!s.wiring) note(s.no, "ไม่มีรูปผังการต่อสาย");
}

console.log(problems.length ? "พบปัญหา:\n" + problems.join("\n") : `ตรวจครบ ${sensors.length} ตัว ไม่พบปัญหา`);
