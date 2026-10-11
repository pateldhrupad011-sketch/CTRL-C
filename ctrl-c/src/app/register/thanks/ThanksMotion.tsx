"use client";

import Link from "next/link";
import { useRef } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { involve } from "@/content/copy";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

const BLOBS = [
  { className: "bg-[var(--lime)]", radius: "42% 58% 63% 37% / 48% 41% 59% 52%", size: "140vmax", x: "-50%", y: "-50%", rot: -12 },
  { className: "bg-[var(--violet)]", radius: "64% 36% 38% 62% / 44% 58% 42% 56%", size: "120vmax", x: "-38%", y: "-62%", rot: 18 },
  { className: "bg-[var(--cyan)]", radius: "38% 62% 55% 45% / 61% 35% 65% 39%", size: "110vmax", x: "-64%", y: "-40%", rot: -28 },
  { className: "bg-[var(--lime)]", radius: "70% 30% 48% 52% / 33% 67% 33% 67%", size: "95vmax", x: "-28%", y: "-55%", rot: 8 },
];

export function ThanksMotion() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = !window.matchMedia(MOTION_OK).matches;
      if (reduced) {
        gsap.set(".thanks-blob", { scale: 1, opacity: 0.85 });
        gsap.set(".thanks-ring", { opacity: 0 });
        gsap.set(".thanks-word, .thanks-line, .thanks-bar", { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(".thanks-blob", { scale: 0, opacity: 1, transformOrigin: "50% 50%" });
      gsap.set(".thanks-ring", { scale: 0.05, opacity: 0.95, transformOrigin: "50% 50%" });
      gsap.set(".thanks-word", { y: 90, scale: 0.72, opacity: 0 });
      gsap.set(".thanks-line, .thanks-bar", { y: 28, opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".thanks-blob", {
        scale: 1,
        duration: 0.95,
        stagger: 0.07,
      })
        .to(
          ".thanks-ring",
          {
            scale: 8,
            opacity: 0,
            duration: 1.05,
            stagger: 0.09,
            ease: "power2.out",
          },
          0.02,
        )
        .to(
          ".thanks-word",
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: "back.out(1.5)",
          },
          0.28,
        )
        .to(
          ".thanks-line, .thanks-bar",
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
          },
          0.55,
        );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative isolate min-h-dvh overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {BLOBS.map((blob, i) => (
          <span
            key={i}
            className={`thanks-blob absolute left-1/2 top-1/2 opacity-90 ${blob.className}`}
            style={{
              width: blob.size,
              height: blob.size,
              marginLeft: blob.x,
              marginTop: blob.y,
              borderRadius: blob.radius,
              rotate: `${blob.rot}deg`,
            }}
          />
        ))}
        <span className="thanks-ring absolute left-1/2 top-1/2 size-[18vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[var(--paper-ink)]" />
        <span className="thanks-ring absolute left-1/2 top-1/2 size-[18vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--paper-ink)]" />
        <span className="thanks-ring absolute left-1/2 top-1/2 size-[18vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--paper-ink)]" />
      </div>

      <header className="thanks-bar absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center">
          <Wordmark className="text-[1.7rem]" decorative />
          <span className="sr-only">Back to the homepage</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-5 py-24 text-center">
        <p className="thanks-line mono text-[var(--paper-ink)]/70">Interest received</p>
        <h1 className="mt-4 max-w-[16ch] leading-[0.82] text-[var(--paper-ink)]">
          <span className="thanks-word display-wide block text-[clamp(4.2rem,18vw,13rem)]">Thank</span>
          <span className="thanks-word display-wide block text-[clamp(4.2rem,18vw,13rem)]">you.</span>
        </h1>
        <p className="thanks-line mx-auto mt-8 max-w-lg text-[1.2rem] text-[var(--paper-ink)]/80 md:text-[1.4rem]">
          {involve.form.successNote}
        </p>
        <Link href="/" className="thanks-line key key--primary mt-10 inline-flex">
          <span>Back to Ctrl C</span>
          <span className="key__hint" aria-hidden="true">
            ←
          </span>
        </Link>
      </main>
    </div>
  );
}
