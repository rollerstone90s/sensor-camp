/**
 * แปลงข้อมูลจากเว็บเวอร์ชันไฟล์เดียว (legacy/data.raw.json)
 * เป็น data/sensors.json ที่ตัดชื่อรุ่นเซนเซอร์ออกทั้งหมด
 * รันด้วย: node scripts/build-data.mjs
 */
import fs from "node:fs";
import path from "node:path";

const raw = JSON.parse(fs.readFileSync("legacy/data.raw.json", "utf8"));

/* คำที่เป็นชื่อรุ่น/ชื่อการค้า -> เปลี่ยนเป็นคำอธิบายตามหน้าที่
   (ตัวโค้ด Arduino ไม่แตะ เพราะต้องคอมไพล์ผ่าน) */
const RENAME = [
  ["โมดูล LDR", "โมดูลเซนเซอร์แสง"],
  ["โมดูล Big Sound", "โมดูลเซนเซอร์เสียงกำลังสูง"],
  ["โมดูลหลอด RGB", "โมดูลหลอดไฟสามสี"],
  ["จอ LCD1602 I2C", "จอแสดงผล 2 บรรทัด"],
  ["จอ LCD", "จอแสดงผล"],
  [
    "ไลบรารี DHT sensor library ของ Adafruit",
    "ไลบรารีเซนเซอร์อุณหภูมิและความชื้น (ชื่อไลบรารีดูได้จากบรรทัด #include ในโค้ด)",
  ],
  ["เซนเซอร์รุ่นนี้", "เซนเซอร์ตัวนี้"],
  ["โมดูลบางรุ่นให้ค่ามากเมื่อมืด บางรุ่นกลับกัน", "โมดูลบางตัวให้ค่ามากเมื่อมืด บางตัวกลับกัน"],
  ["เฉพาะรุ่นที่เป็นโมดูล", "เฉพาะแบบที่เป็นโมดูล"],
];

const scrub = (s) =>
  typeof s === "string" ? RENAME.reduce((t, [a, b]) => t.split(a).join(b), s) : s;

/* ฟิลด์ที่เป็นข้อความอธิบาย — ล้างชื่อรุ่น ส่วนตัวคำสั่งในโค้ดปล่อยไว้เดิม */
const PROSE = ["th", "warn", "parts", "how", "result", "next", "job"];

/* คำที่บอกว่าวงเล็บนั้นเป็นชื่อรุ่นภาษาอังกฤษ ไม่ใช่คำอธิบายทั่วไป */
const MODEL_WORD =
  /\b(sensor|module|ldr|dht|encoder|relay|switch|laser|flame|reed|rgb|ultrasonic|hall|tracking|shock|vibration|sound|tap|knock|button|photoresistor|heartbeat|pulse|emit|magnetic|rotary|big)\b/i;

/* ล้างเฉพาะ "คอมเมนต์" ในโค้ด ตัวคำสั่งจริงไม่แตะ เพราะต้องคอมไพล์ผ่าน */
function scrubComment(text) {
  return text
    .replace(/\(([^)]*)\)/g, (m, inner) => {
      if (!MODEL_WORD.test(inner)) return m;
      // ตัดคำอังกฤษที่เป็นชื่อรุ่นออก ถ้าในวงเล็บเหลือแต่คำไทยก็เก็บวงเล็บไว้
      const left = inner
        .replace(/(?<![0-9])[A-Za-z][A-Za-z0-9.+-]*/g, " ")
        .replace(/[/·]/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim();
      return left ? `(${left})` : "";
    })
    .replace(/\bRGB\b/g, "")
    .replace(/["']?DHT sensor library["']?\s*(ของ\s*Adafruit)?/gi, "ไลบรารีเซนเซอร์อุณหภูมิและความชื้น")
    .replace(/\bBig Sound\b/gi, "เซนเซอร์เสียงกำลังสูง")
    .replace(/ฐานที่\s*([1-9])/g, "จุดสำรวจที่ $1")
    .replace(/ฐาน\s*([1-9])/g, "จุดสำรวจที่ $1")
    .replace(/\bLCD ?1602\b/gi, "จอแสดงผล")
    .replace(/\bLCD\b/g, "จอแสดงผล")
    .replace(/\bLDR\b/g, "เซนเซอร์แสง")
    .replace(/\bDHT\b/g, "เซนเซอร์")
    .replace(/ไลบรารี\s+ไลบรารี/g, "ไลบรารี")
    .replace(/\s{2,}$/, "")
    .replace(/:\s*$/, "");
}

/* คอมเมนต์หัวไฟล์ที่ซ้ำกับข้อมูลบนหน้าเว็บอยู่แล้ว (ชื่อเซนเซอร์ จุดสำรวจ ตารางต่อสาย)
   ตัดออกให้เหลือแต่โค้ด ส่วนคอมเมนต์เตือนความปลอดภัยหรือวิธีลงไลบรารีเก็บไว้ */
const HEADER_LINE = [
  /^\s*\/\/\s*=+\s*$/,
  /^\s*\/\/\s*เซนเซอร์ที่\s*\d+/,
  /^\s*\/\/\s*จุดสำรวจที่\s*\d+/,
  /^\s*\/\/\s*(การต่อสาย|ต่อสาย)\s*:/,
  /^\s*\/\/\s*ลูกเล่น\s*:/,
];

function stripHeader(code) {
  const lines = code.split("\n");
  // ขอบเขตหัวไฟล์ = ช่วงต้นที่มีแต่คอมเมนต์กับบรรทัดว่าง
  let end = 0;
  while (end < lines.length && (lines[end].trim() === "" || lines[end].trim().startsWith("//"))) end++;

  const kept = lines.slice(0, end).filter((l) => !HEADER_LINE.some((rx) => rx.test(l)));
  const rest = lines.slice(end);
  while (kept.length && kept[0].trim() === "") kept.shift();
  while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

  return (kept.length ? kept.join("\n") + "\n\n" : "") + rest.join("\n").replace(/^\n+/, "");
}

/** แยกส่วนคอมเมนต์ท้ายบรรทัดออกมาล้าง โดยข้ามบรรทัดที่ // อยู่ในสตริง */
function scrubCode(code) {
  return code
    .split("\n")
    .map((line) => {
      const i = line.indexOf("//");
      if (i < 0) return line;
      const before = line.slice(0, i);
      const quotes = (before.match(/(?<!\\)"/g) ?? []).length;
      if (quotes % 2 === 1) return line; // // อยู่ในสตริง ไม่ใช่คอมเมนต์
      return before + scrubComment(line.slice(i));
    })
    .join("\n");
}

/* ของที่แก้ทับรายตัว: ข้อความอยู่ใน data/overrides.json โค้ดอยู่ใน data/code/<เลข>.ino
   โค้ดที่ใส่ทับถือว่าเป็นฉบับที่ตรวจแล้ว จึงไม่เอาไปล้างคอมเมนต์ซ้ำ */
/* มีรูปผังการต่อสายของตัวไหนบ้าง ดูจากไฟล์ใน public/wiring ตรง ๆ */
const WIRING_DIR = path.join("public", "wiring");
const hasWiring = new Set(
  (fs.existsSync(WIRING_DIR) ? fs.readdirSync(WIRING_DIR) : [])
    .filter((f) => f.endsWith(".webp"))
    .map((f) => f.replace(/\.webp$/, "")),
);

const overrides = fs.existsSync("data/overrides.json")
  ? JSON.parse(fs.readFileSync("data/overrides.json", "utf8"))
  : {};

function overrideCode(no) {
  const file = path.join("data", "code", `${no}.ino`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").trimEnd() : null;
}


/* ชื่อขาให้เป็นรูปแบบเดียวกันทั้งเว็บ เด็กจะได้ไม่ต้องเดาว่า VCC กับ + คือขาเดียวกันไหม
   ขาที่ชื่อบอกหน้าที่เฉพาะ (TX/RX, TRIG/ECHO, CLK/DT/SW, DO คู่ AO, R/G/B, IN, COM/NO)
   ปล่อยไว้ตามเดิม เพราะถ้าเปลี่ยนแล้วจะต่อผิดขา */
const POWER_ALIAS = /^(vcc|\+|\+ ?\/ ?vcc|vcc ?\/ ?\+)$/i;
const GROUND_ALIAS = /^(gnd|-|- ?\/ ?gnd|gnd ?\/ ?-)$/i;
const SIGNAL_ALIAS = /^(s|out|s ?\/ ?out|out ?\/ ?s|out ?\/ ?do|do ?\/ ?out|data ?\/ ?out|data)$/i;

/* ในแต่ละอุปกรณ์ ให้เรียงขาสัญญาณขึ้นก่อน แล้วค่อยขาไฟ ปิดท้ายด้วยขากราวด์
   เรียงแบบคงลำดับเดิมภายในกลุ่มเดียวกัน (เช่น TX ก่อน RX, CLK ก่อน DT ก่อน SW) */
const PIN_ORDER = { pwr: 1, gnd: 2 };

function reorderPins(pins) {
  const groups = [];
  for (const p of pins) {
    const device = p[4] ?? "";
    const last = groups[groups.length - 1];
    if (last && last.device === device) last.rows.push(p);
    else groups.push({ device, rows: [p] });
  }
  return groups.flatMap((g) =>
    g.rows
      .map((row, i) => ({ row, i }))
      .sort((a, b) => (PIN_ORDER[a.row[2]] ?? 0) - (PIN_ORDER[b.row[2]] ?? 0) || a.i - b.i)
      .map((x) => x.row),
  );
}

function normalizePins(pins) {
  return pins.map((p) => {
    const [label, pin, kind, note, device] = p;
    let next = label;
    if (kind === "pwr" && POWER_ALIAS.test(label.trim())) next = "+ / VCC";
    else if (kind === "gnd" && GROUND_ALIAS.test(label.trim())) next = "- / GND";
    else if (SIGNAL_ALIAS.test(label.trim())) next = "S / OUT";
    return device === undefined ? [next, pin, kind, note] : [next, pin, kind, note, device];
  });
}

const sensors = raw.sensors.map((s) => {
  const out = { ...s };
  delete out.en; // ชื่อรุ่นภาษาอังกฤษ ตัดทิ้งทั้งหมด
  for (const f of PROSE) out[f] = scrub(out[f]);
  out.pins = s.pins.map((p) => p.map(scrub));
  out.code = scrubCode(out.code);
  for (const k of ["fun", "lcd"]) {
    if (out[k])
      out[k] = {
        ...out[k],
        desc: scrub(out[k].desc),
        parts: scrub(out[k].parts),
        code: scrubCode(out[k].code),
      };
  }

  const code = overrideCode(out.no);
  if (code) out.code = code;
  const fields = overrides[out.no];
  if (fields) Object.assign(out, fields);

  out.pins = reorderPins(normalizePins(out.pins));
  out.wiring = hasWiring.has(out.no);
  out.code = stripHeader(out.code);
  for (const k of ["fun", "lcd"]) {
    if (out[k]) out[k] = { ...out[k], code: stripHeader(out[k].code) };
  }

  return out;
});

/* ตรวจซ้ำว่าไม่มีชื่อรุ่นหลงเหลือในข้อความ */
const LEFT = /LDR|LCD160|Big ?Sound|Adafruit|DHT sensor|รุ่น/i;
const leftovers = [];
for (const s of sensors) {
  for (const f of PROSE) if (LEFT.test(s[f] || "")) leftovers.push(`${s.no}.${f}: ${s[f]}`);
  for (const k of ["fun", "lcd"])
    if (s[k])
      for (const f of ["desc", "parts"])
        if (LEFT.test(s[k][f] || "")) leftovers.push(`${s.no}.${k}.${f}: ${s[k][f]}`);
  for (const p of s.pins) for (const c of p) if (LEFT.test(c)) leftovers.push(`${s.no}.pin: ${c}`);
}

/* ปรับได้ว่าจุดสำรวจไหนมีเซนเซอร์ตัวใดบ้าง ผ่านคีย์ _bases ใน overrides.json */
const bases = { ...raw.bases, ...(overrides._bases ?? {}) };
for (const s of sensors) {
  const at = Object.entries(bases).find(([, list]) => list.includes(s.no));
  if (at) s.base = Number(at[0]);
}

const data = {
  groups: raw.groups,
  bases,
  baseGroup: raw.baseGroup,
  sensors,
};

fs.mkdirSync("data", { recursive: true });
fs.writeFileSync(path.join("data", "sensors.json"), JSON.stringify(data, null, 2));

console.log(
  `เขียน data/sensors.json แล้ว · เซนเซอร์ ${sensors.length} ตัว · มีรูปผังต่อสาย ${sensors.filter((s) => s.wiring).length} ตัว`,
);
console.log(leftovers.length ? "ยังพบชื่อรุ่นค้างอยู่:\n" + leftovers.join("\n") : "ไม่พบชื่อรุ่นค้างในข้อความ");
