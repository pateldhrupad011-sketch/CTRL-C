"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/** Gently bobs and sways its children, forever. */
export function Float({
  children,
  className = "",
  distance = 14,
  sway = 0.8,
  duration = 3.2,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  sway?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      if (!ready) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.to(ref.current, {
          y: -distance,
          rotation: sway,
          duration,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });
      return () => mm.revert();
    },
    { dependencies: [ready, distance, sway, duration] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
