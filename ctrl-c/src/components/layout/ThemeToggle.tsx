"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { applyTheme, readStoredTheme, useTheme } from "@/lib/use-theme";

const noopSubscribe = () => () => {};

export function ThemeToggle() {
  const theme = useTheme();
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // React's dev-mode remount resets <html> attributes; re-apply the stored theme before paint.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    if (stored) applyTheme(stored, false);
  }, []);

  const next = theme === "dark" ? "light" : "dark";

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) {
      applyTheme(next);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${r}px`);
    document.startViewTransition(() => applyTheme(next));
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={hydrated ? `Switch to ${next} theme` : "Switch color theme"}
      title={hydrated ? `Switch to ${next} theme` : undefined}
    >
      <svg
        className="theme-icon--moon"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        className="theme-icon--sun"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
