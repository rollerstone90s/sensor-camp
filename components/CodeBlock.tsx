"use client";

import { useState } from "react";

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* ตกไปใช้วิธีสำรอง */
    }
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.cssText = "position:fixed;top:-9999px";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

/** โค้ดหนึ่งชุดต่อเซนเซอร์ หัวแถวซ้ายเป็นคำว่าโค้ด ขวาเป็นปุ่มคัดลอก */
export default function CodeBlock({ code, html }: { code: string; html: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      <div className="pane-h">
        <span>โค้ด</span>
        <button
          className={`copy${copied ? " ok" : ""}`}
          onClick={async () => {
            if (!(await copyText(code))) {
              alert("คัดลอกอัตโนมัติไม่ได้ ให้ลากเลือกโค้ดแล้วกด Ctrl+C แทน");
              return;
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
        >
          {copied ? "คัดลอกแล้ว" : "คัดลอก"}
        </button>
      </div>

      <div className="code-wrap">
        <pre>
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </>
  );
}
