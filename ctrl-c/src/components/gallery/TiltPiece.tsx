"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type TiltPieceProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  caption: ReactNode;
  tape?: CSSProperties[];
};

/**
 * A pinned sheet on the wall. On fine pointers it tilts toward the cursor by
 * writing CSS variables directly — no React state per pointer move.
 */
export function TiltPiece({ children, className = "", style, caption, tape = [] }: TiltPieceProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    let rect: DOMRect | null = null;

    const onEnter = () => {
      if (!mq.matches) return;
      rect = el.getBoundingClientRect();
      el.dataset.active = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!mq.matches || !rect) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      rect = null;
      delete el.dataset.active;
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <figure ref={ref} className={`piece ${className}`} style={style}>
      {tape.map((t, i) => (
        <span key={i} className="tape" style={t} aria-hidden="true" />
      ))}
      <div className="piece__sheet" aria-hidden="true">
        {children}
      </div>
      <figcaption className="piece__caption mono">{caption}</figcaption>
    </figure>
  );
}
