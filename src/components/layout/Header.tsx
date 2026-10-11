"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { nav } from "@/content/copy";
import { ThemeToggle } from "./ThemeToggle";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled(threshold: number) {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

export function Header() {
  const scrolled = useScrolled(16);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef(false);

  const close = useCallback((returnFocus: boolean) => {
    restoreFocus.current = returnFocus;
    setOpen(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const outside = [document.getElementById("main"), document.getElementById("site-footer")];

    if (!open) {
      if (restoreFocus.current) toggleRef.current?.focus();
      restoreFocus.current = false;
      return;
    }

    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    outside.forEach((el) => el?.setAttribute("inert", ""));
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => desktop.matches && close(false);

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = previousOverflow;
      outside.forEach((el) => el?.removeAttribute("inert"));
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open, close]);

  return (
    <header className="site-header" data-scrolled={scrolled} data-open={open}>
      <div className="wrap flex h-full items-center justify-between gap-6">
        <a
          href="#top"
          className="-ml-1 rounded-md px-1 py-1.5"
          aria-label="Ctrl C, back to top"
          onClick={() => open && close(false)}
        >
          <Wordmark decorative className="text-[1.7rem]" />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="nav-link">
                  <span className="nav-link__num" aria-hidden="true">
                    {item.sheet}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            className="icon-key inline-flex w-auto gap-2 px-3.5 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? close(true) : setOpen(true))}
          >
            <span className="text-sm font-semibold">{open ? "Close" : "Menu"}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              {open ? (
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.6" />
              ) : (
                <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.6" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu lg:hidden" hidden={!open}>
        <nav aria-label="Mobile" className="wrap flex min-h-full flex-col pt-6 pb-10">
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li
                key={item.id}
                className="mobile-menu__item border-t border-line"
                style={{ "--i": i } as React.CSSProperties}
              >
                <a
                  href={`#${item.id}`}
                  onClick={() => close(false)}
                  className="flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="display text-[clamp(2.4rem,11vw,4rem)]">{item.label}</span>
                  <span className="mono text-faint" aria-hidden="true">
                    {item.sheet}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mono mt-auto border-t border-line pt-5 text-muted">
            Ctrl C · Rev. A · A student-led build community
          </p>
        </nav>
      </div>
    </header>
  );
}
