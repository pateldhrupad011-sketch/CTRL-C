"use client";

import Link from "next/link";
import { useRef } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

const DRIFT = [
  { ch: "4", className: "top-[12%] left-[8%] text-[clamp(3rem,8vw,7rem)] -rotate-[18deg]" },
  { ch: "0", className: "top-[18%] right-[10%] text-[clamp(2.4rem,6vw,5.2rem)] rotate-[12deg]" },
  { ch: "4", className: "bottom-[14%] left-[14%] text-[clamp(2.8rem,7vw,6rem)] rotate-[8deg]" },
  { ch: "C", className: "bottom-[16%] right-[12%] text-[clamp(3.2rem,8vw,7.5rem)] -rotate-[8deg] text-[var(--violet-ink)]" },
];

export function NotFoundStage() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!window.matchMedia(MOTION_OK).matches) return;

      gsap.from(".nf-digit", {
        y: 80,
        rotateX: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: "back.out(1.6)",
      });
      gsap.from(".nf-key", {
        y: 36,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        delay: 0.25,
        ease: "power3.out",
      });
      gsap.from(".nf-copy", {
        y: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        delay: 0.4,
        ease: "power2.out",
      });
      gsap.to(".nf-ghost", {
        opacity: 0.35,
        duration: 1.4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
      gsap.to(".nf-drift", {
        y: "+=18",
        rotate: "+=6",
        duration: (i) => 2.4 + i * 0.35,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.2,
      });
      gsap.to(".nf-c", {
        x: 28,
        y: -42,
        rotate: 18,
        duration: 1.1,
        delay: 0.35,
        ease: "back.out(1.8)",
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative isolate min-h-dvh overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {DRIFT.map((item) => (
        <span
          key={item.ch + item.className}
          aria-hidden="true"
          className={`nf-drift display-wide pointer-events-none absolute text-faint/40 ${item.className}`}
        >
          {item.ch}
        </span>
      ))}

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center">
          <Wordmark className="text-[1.7rem]" decorative />
          <span className="sr-only">Back to the homepage</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-28 text-center">
        <p className="nf-copy mono text-faint">Error · 404</p>

        <p className="mt-6 flex items-baseline justify-center gap-[0.08em] leading-none" aria-hidden="true">
          <span className="nf-digit display-wide text-[clamp(5.5rem,22vw,16rem)]">4</span>
          <span className="nf-digit relative mx-[0.06em] inline-grid place-items-center">
            <kbd className="nf-ghost cap cap--c size-[0.62em] min-w-0 border-dashed bg-transparent text-transparent shadow-none">
              C
            </kbd>
            <span className="display-wide absolute text-[0.42em] text-faint">0</span>
          </span>
          <span className="nf-digit display-wide text-[clamp(5.5rem,22vw,16rem)]">4</span>
        </p>
        <h1 className="sr-only">404 — this page didn’t copy</h1>

        <div className="nf-copy mt-8 flex items-end justify-center gap-3">
          <kbd className="nf-key cap text-[1.15rem]">ctrl</kbd>
          <span className="nf-key mono text-faint">+</span>
          <span className="relative">
            <kbd className="nf-ghost cap cap--c border-dashed bg-transparent text-transparent shadow-none">C</kbd>
            <kbd className="nf-c nf-key cap cap--c absolute top-0 left-0">C</kbd>
          </span>
        </div>

        <p className="nf-copy display-wide mt-10 max-w-[18ch] text-[clamp(1.8rem,4vw,3.2rem)] leading-[0.95]">
          <ScrambleText text="This page didn’t copy." trigger="load" duration={1.1} announce />
        </p>
        <p className="nf-copy mt-4 max-w-md text-[1.12rem] text-muted">
          Nothing here to paste. It may have been moved, or it never existed.
        </p>

        <Link href="/" className="nf-copy key key--primary mt-10 inline-flex">
          <span>Back to Ctrl C</span>
          <span className="key__hint" aria-hidden="true">
            ←
          </span>
        </Link>
      </main>
    </div>
  );
}
