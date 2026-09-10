const KEYWORDS =
  "if|else|while|for|return|void|const|bool|true|false|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|include|define|break|continue|switch|case";
const TYPES = "int|long|float|byte|unsigned|char|double|String";

const escapeHtml = (t: string) =>
  t.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);

/* สตริง คำสงวน ชนิดข้อมูล และตัวเลข — จับรวดเดียวจบ สตริงจึงชนะเสมอเมื่อซ้อนกัน */
const TOKEN = new RegExp(
  [
    `("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')`,
    `\\b(${KEYWORDS})\\b`,
    `\\b(${TYPES})\\b`,
    `\\b(0x[0-9A-Fa-f]+|\\d+\\.?\\d*)\\b`,
  ].join("|"),
  "g",
);

function paintCode(part: string): string {
  return part.replace(TOKEN, (_m, str, kw, ty, num) => {
    if (str) return `<span class="st">${str}</span>`;
    if (kw) return `<span class="kw">${kw}</span>`;
    if (ty) return `<span class="ty">${ty}</span>`;
    return `<span class="nu">${num}</span>`;
  });
}

/** ตำแหน่งของ // ที่เป็นคอมเมนต์จริง (ไม่ใช่ // ที่อยู่ในสตริง) */
function commentAt(line: string): number {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === "/" && line[i + 1] === "/") {
      return i;
    }
  }
  return -1;
}

/**
 * ระบายสีโค้ด Arduino แบบเบา ๆ พอให้อ่านง่ายบนจอโปรเจกเตอร์
 * คืนค่าเป็น HTML ที่ escape แล้ว จึงฝังด้วย dangerouslySetInnerHTML ได้
 */
export function highlight(src: string): string {
  return escapeHtml(src)
    .split("\n")
    .map((line) => {
      const i = commentAt(line);
      if (i < 0) return paintCode(line);
      return paintCode(line.slice(0, i)) + `<span class="cm">${line.slice(i)}</span>`;
    })
    .join("\n");
}
