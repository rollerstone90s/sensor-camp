"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ZoomIcon } from "@/components/Icons";

const MIN = 1;
const MAX = 5;
const STEP = 1.35;
const clamp = (z: number) => Math.min(MAX, Math.max(MIN, z));

/**
 * รูปผังการต่อสาย กดแล้วเปิดดูแบบเต็มจอ
 * ตอนซูมเข้าไป กรอบรูปจะมีแถบเลื่อนของเบราว์เซอร์เอง
 * จึงเลื่อนดูได้ทั้งล้อเมาส์ แทร็กแพด นิ้วบนมือถือ และลากด้วยเมาส์
 */
export default function WiringFigure({ src, title }: { src: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, y: 0, left: 0, top: 0 });

  /** ซูมโดยยึดจุดกึ่งกลางที่มองอยู่ ไม่ให้ภาพกระโดดหนี */
  const zoomBy = useCallback((factor: number) => {
    const stage = stageRef.current;
    if (!stage) {
      setZoom((z) => clamp(z * factor));
      return;
    }
    const cx = (stage.scrollLeft + stage.clientWidth / 2) / Math.max(stage.scrollWidth, 1);
    const cy = (stage.scrollTop + stage.clientHeight / 2) / Math.max(stage.scrollHeight, 1);

    setZoom((z) => {
      const next = clamp(z * factor);
      if (next !== z) {
        requestAnimationFrame(() => {
          const s = stageRef.current;
          if (!s) return;
          s.scrollLeft = cx * s.scrollWidth - s.clientWidth / 2;
          s.scrollTop = cy * s.scrollHeight - s.clientHeight / 2;
        });
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setZoom(1);
    const s = stageRef.current;
    if (s) {
      s.scrollLeft = 0;
      s.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "+" || e.key === "=") zoomBy(STEP);
      else if (e.key === "-") zoomBy(1 / STEP);
      else if (e.key === "0") reset();
    };
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      removeEventListener("keydown", onKey);
    };
  }, [open, zoomBy, reset]);

  // ล้อเมาส์เปล่า = เลื่อนดูตามปกติ · กด Ctrl (หรือหุบนิ้วบนแทร็กแพด) = ซูม
  useEffect(() => {
    const stage = stageRef.current;
    if (!open || !stage) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomBy(e.deltaY < 0 ? STEP : 1 / STEP);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [open, zoomBy]);

  return (
    <>
      <figure className="fig">
        <button
          className="fig-btn"
          onClick={() => {
            reset();
            setOpen(true);
          }}
          aria-label={`ขยายผังการต่อสาย ${title}`}
        >
          {/* รูปเป็นไฟล์ static ในโปรเจกต์ ใช้ img ธรรมดาเพื่อให้ export ออกไปได้ตรง ๆ */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={`ผังการต่อสาย ${title}`} loading="lazy" />
          <span className="fig-tag">
            <ZoomIcon /> กดเพื่อขยาย
          </span>
        </button>
      </figure>

      {open && (
        <div className="lb" role="dialog" aria-modal="true" aria-label={`ผังการต่อสาย ${title}`}>
          <div className="lb-bar">
            <span className="lb-title">ผังการต่อสาย · {title}</span>
            <span className="lb-tools">
              <button className="lb-b" onClick={() => zoomBy(1 / STEP)} aria-label="ย่อ" disabled={zoom <= MIN}>
                −
              </button>
              <span className="lb-pct">{Math.round(zoom * 100)}%</span>
              <button className="lb-b" onClick={() => zoomBy(STEP)} aria-label="ขยาย" disabled={zoom >= MAX}>
                +
              </button>
              <button className="lb-b lb-w" onClick={reset}>
                พอดีจอ
              </button>
              <button className="lb-b lb-w" onClick={() => setOpen(false)}>
                ปิด
              </button>
            </span>
          </div>

          <div
            className="lb-stage"
            ref={stageRef}
            data-zoomed={zoom > 1 ? "true" : "false"}
            onClick={(e) => {
              if (e.target === e.currentTarget) setOpen(false);
            }}
            // ลากด้วยเมาส์ได้ ส่วนนิ้วบนจอสัมผัสปล่อยให้เลื่อนแบบปกติของเครื่อง
            onPointerDown={(e) => {
              if (e.pointerType !== "mouse" || zoom <= 1) return;
              const s = e.currentTarget;
              drag.current = { on: true, x: e.clientX, y: e.clientY, left: s.scrollLeft, top: s.scrollTop };
              s.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current.on) return;
              e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
              e.currentTarget.scrollTop = drag.current.top - (e.clientY - drag.current.y);
            }}
            onPointerUp={() => (drag.current.on = false)}
            onPointerCancel={() => (drag.current.on = false)}
          >
            <div className="lb-canvas" data-fit={zoom === 1 ? "true" : "false"} style={{ width: `${zoom * 100}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`ผังการต่อสาย ${title}`}
                draggable={false}
                onDoubleClick={() => (zoom > 1 ? reset() : zoomBy(STEP * STEP))}
              />
            </div>
          </div>

          <p className="lb-hint">
            เลื่อนดูด้วยแถบเลื่อนหรือลากรูป · กด Ctrl ค้างแล้วหมุนล้อเมาส์เพื่อซูม · กด Esc เพื่อปิด
          </p>
        </div>
      )}
    </>
  );
}
