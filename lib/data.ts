import raw from "@/data/sensors.json";

export type GroupKey = "med" | "agr" | "eng" | "saf";

/**
 * ขาเซนเซอร์: [ชื่อขาบนโมดูล, ขาที่ต่อบน Arduino, ชนิดสาย, คำอธิบาย, ชื่ออุปกรณ์]
 * ช่องสุดท้ายใส่เมื่อการ์ดนั้นต่อหลายอุปกรณ์ เพื่อแยกหัวข้อว่าเป็นสายของอะไร
 * ถ้าไม่ใส่ ถือว่าเป็นขาของตัวเซนเซอร์เอง
 */
export type Pin = [string, string, WireKind, string, string?];

export type PinGroup = { device: string; pins: Pin[] };

/** จัดขาเป็นกลุ่มตามอุปกรณ์ โดยคงลำดับเดิมไว้ */
export function pinGroups(s: Sensor): PinGroup[] {
  const groups: PinGroup[] = [];
  for (const p of s.pins) {
    const device = p[4] ?? s.th;
    const last = groups[groups.length - 1];
    if (last && last.device === device) last.pins.push(p);
    else groups.push({ device, pins: [p] });
  }
  return groups;
}
export type WireKind = "pwr" | "gnd" | "dig" | "ana" | "other";

export type CodeVariant = { desc: string; parts: string; code: string };

export type Sensor = {
  no: string;
  base: number;
  group: GroupKey;
  th: string;
  /** ชื่อภาษาอังกฤษกำกับใต้ชื่อไทย */
  en: string;
  how: string;
  result: string;
  next: string;
  job: string;
  parts: string;
  warn: string;
  /** ขั้นตอนการทดลองที่จุดสำรวจ */
  steps: string[];
  pins: Pin[];
  code: string;
  /** มีไฟล์รูปผังการต่อสายอยู่ที่ public/wiring หรือไม่ (สคริปต์เป็นคนเติมให้) */
  wiring: boolean;
  fun?: CodeVariant;
  lcd?: CodeVariant;
};

type Data = {
  groups: Record<GroupKey, string>;
  bases: Record<string, string[]>;
  baseGroup: Record<string, GroupKey>;
  sensors: Sensor[];
};

const data = raw as unknown as Data;

export const GROUPS = data.groups;
export const BASES = data.bases;
export const BASE_GROUP = data.baseGroup;
export const SENSORS = data.sensors;

/** เลขจุดสำรวจทั้งหมด เรียงจากน้อยไปมาก */
export const STATION_IDS = Object.keys(BASES)
  .map(Number)
  .sort((a, b) => a - b);

const byNo = new Map(SENSORS.map((s) => [s.no, s]));

export function sensor(no: string): Sensor {
  const s = byNo.get(no);
  if (!s) throw new Error(`ไม่พบเซนเซอร์หมายเลข ${no}`);
  return s;
}

export function stationSensors(id: number): Sensor[] {
  return (BASES[String(id)] ?? []).map(sensor);
}

export function stationGroup(id: number): GroupKey {
  return BASE_GROUP[String(id)];
}

/** ชื่อย่อของจุดสำรวจ ใช้เป็นคำโปรยใต้หัวข้อ */
export function stationTitle(id: number): string {
  return stationSensors(id)
    .map((s) => s.th)
    .join(" · ");
}

/** รูปผังการต่อสาย วางไฟล์ชื่อตามเลขเซนเซอร์ไว้ที่ public/wiring แล้วรัน npm run data */
export function wiringImage(no: string): string | null {
  return sensor(no).wiring ? `/wiring/${no}.webp` : null;
}
