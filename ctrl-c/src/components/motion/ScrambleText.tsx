"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

const CHARS = "abcdefghijklmnopqrstuvwxyz";

type ScrambleTextProps = {
  text: string;
  /** "load" plays straight away; "scroll" waits until the text enters the viewport. */
  trigger?: "load" | "scroll";
  delay?: number;
  duration?: number;
  /** Multi-line text: keeps its wrapping and holds its height while scrambling. */
  block?: boolean;
  /** Also render the real text for screen readers (otherwise label the parent element). */
  announce?: boolean;
};

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

/** The first `revealed` characters are real; the rest are random letters, keeping spaces so text still wraps. */
function noise(text: string, revealed = 0) {
  return text.slice(0, revealed) + text.slice(revealed).replace(/\S/g, randomChar);
}

function onScreen(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const vh = innerHeight;
  return r.top < vh * 0.9 && r.bottom > vh * 0.12;
}

function scrolledIntoPage() {
  return scrollY > 40 || Boolean(location.hash);
}

/** Text that decodes from random letters. The scrambling copy is hidden from assistive tech. */
export function ScrambleText({
  text,
  trigger = "load",
  delay = 0,
  duration = 1.4,
  block = false,
  announce = false,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        let tween: gsap.core.Tween | undefined;
        let started = false;

        const play = () => {
          if (started) return;
          started = true;
          if (block) el.style.height = `${el.offsetHeight}px`;
          else el.style.whiteSpace = "nowrap";
          el.textContent = noise(text);
          const state = { progress: 0 };
          let frame = -1;
          tween = gsap.to(state, {
            progress: 1,
            duration,
            delay,
            ease: "none",
            onUpdate: () => {
              const f = Math.floor(state.progress * duration * 20);
              if (f === frame) return;
              frame = f;
              const reveal = Math.max(0, (state.progress - 0.25) / 0.75);
              el.textContent = noise(text, Math.floor(reveal * text.length));
            },
            onComplete: () => {
              el.textContent = text;
              el.style.height = "";
              el.style.whiteSpace = "";
            },
          });
        };

        if (trigger === "load") {
          play();
          return () => tween?.kill();
        }

        const maybePlay = () => {
          if (onScreen(el) && scrolledIntoPage()) play();
        };

        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) maybePlay();
          },
          { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
        );
        io.observe(el);
        window.addEventListener("scroll", maybePlay, { passive: true });
        maybePlay();

        return () => {
          tween?.kill();
          io.disconnect();
          window.removeEventListener("scroll", maybePlay);
          el.textContent = text;
          el.style.height = "";
          el.style.whiteSpace = "";
        };
      });
      return () => mm.revert();
    },
    { dependencies: [text, trigger, delay, duration, block] },
  );

  return (
    <>
      {announce && <span className="sr-only">{text}</span>}
      <span ref={ref} aria-hidden="true" className={block ? "block" : undefined}>
        {text}
      </span>
    </>
  );
}
