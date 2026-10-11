"use client";

import { useEffect, useRef } from "react";

const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));

/**
 * Scroll-linked entrance for every `.bend-item` inside it: items arrive one
 * after another along a curved path, bent back and shrunk, and flatten out as
 * they land. Scroll speed adds extra bend that springs back when you stop.
 */
export function ScrollBend({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = [...root.querySelectorAll<HTMLElement>(".bend-item")];
    let lastY = scrollY;
    let velocity = 0;
    let frame = 0;
    let visible = false;

    const tick = () => {
      const y = scrollY;
      velocity += (y - lastY - velocity) * 0.12;
      lastY = y;
      const v = clamp(velocity, -60, 60);

      const vh = innerHeight;
      const progress = clamp((vh - root.getBoundingClientRect().top) / (vh * 0.95));

      items.forEach((el, i) => {
        const p = clamp((progress - 0.05 - i * 0.24) / 0.4);
        const e = 1 - Math.pow(1 - p, 3);
        const t = 1 - e;
        const x = t * t * 220;
        const yOff = t * 260;
        const rz = t * 10;
        const bend = t * 55 - v * 0.6;
        const scale = (0.6 + 0.4 * e) * (1 - Math.min(Math.abs(v) * 0.004, 0.12));
        el.style.opacity = e.toFixed(3);
        el.style.transform = `perspective(900px) translate3d(${x.toFixed(1)}px, ${yOff.toFixed(1)}px, 0) rotateZ(${rz.toFixed(2)}deg) rotateX(${bend.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      });

      if (visible || Math.abs(velocity) > 0.05) frame = requestAnimationFrame(tick);
      else frame = 0;
    };

    tick();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        lastY = scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(root);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
