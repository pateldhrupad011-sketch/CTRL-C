"use client";

import { useEffect, useState } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/**
 * Scrubs every `.reveal` / `.reveal-late` block into place as it scrolls in, like
 * parts of an exploded drawing coming together: later blocks in a section travel further.
 * Blocks that contain their own scrubbed animation (`[data-scrub]`) keep the CSS reveal.
 */
export function ScrollAssemble() {
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
        const assemble = (section: Element) => {
          const blocks = gsap.utils
            .toArray<HTMLElement>(section.querySelectorAll(".reveal, .reveal-late"))
            .filter(
              (el) =>
                !el.dataset.scrubbed &&
                !el.querySelector("[data-scrub]") &&
                !el.closest("[data-scrub]"),
            );

          blocks.forEach((el, i) => {
            const late = el.classList.contains("reveal-late");
            el.style.animation = "none";
            el.dataset.scrubbed = "";
            gsap.fromTo(
              el,
              { y: 70 + Math.min(i, 4) * 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                ease: "power1.out",
                scrollTrigger: {
                  trigger: el,
                  start: late ? "top 90%" : "top 98%",
                  end: late ? "top 50%" : "top 60%",
                  scrub: 0.8,
                },
              },
            );
          });
        };

        document.querySelectorAll("main section").forEach(assemble);

        const main = document.querySelector("main");
        let observer: MutationObserver | null = null;
        if (main) {
          observer = new MutationObserver((records) => {
            for (const record of records) {
              for (const node of record.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                if (node.matches("section")) assemble(node);
                node.querySelectorAll("section").forEach(assemble);
              }
            }
          });
          observer.observe(main, { childList: true, subtree: true });
        }

        return () => {
          observer?.disconnect();
          document.querySelectorAll<HTMLElement>("[data-scrubbed]").forEach((el) => {
            el.style.animation = "";
            delete el.dataset.scrubbed;
          });
        };
      });
      return () => mm.revert();
    },
    { dependencies: [ready] },
  );

  return null;
}