"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";
import { EXPLODE_OFFSETS } from "./ExplodedSession";

/** Scrubs the build-session diagram from an assembled key to its exploded view, then presses the C key. */
export function ExplodeOnScroll({ children }: { children: ReactNode }) {
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
        const tl = gsap.timeline({
          defaults: { ease: "power1.inOut" },
          scrollTrigger: { trigger: ref.current, start: "center 90%", end: "center 50%", scrub: 0.8 },
        });

        EXPLODE_OFFSETS.forEach((dy, i) => {
          tl.from(`[data-part="${i}"]`, { y: dy, duration: 1 }, i * 0.08);
          tl.from(`[data-label="${i}"]`, { opacity: 0, x: -14, duration: 0.4 }, 0.6 + i * 0.08);
        });

        tl.to('[data-part="0"]', { y: 9, duration: 0.18, ease: "power1.in" }, ">")
          .to("[data-glow]", { opacity: 0.75, duration: 0.18 }, "<")
          .to('[data-part="0"]', { y: 0, duration: 0.4, ease: "back.out(3)" })
          .to("[data-glow]", { opacity: 0.45, duration: 0.4 }, "<");

        gsap.to("[data-float]", { y: -8, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [ready] },
  );

  return (
    <div ref={ref} data-scrub>
      {children}
    </div>
  );
}
