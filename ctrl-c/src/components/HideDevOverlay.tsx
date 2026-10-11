"use client";

import { useEffect } from "react";

/** Hides the Next.js `N` issues badge. It is not part of the site. */
export function HideDevOverlay() {
  useEffect(() => {
    const hide = () => {
      document.querySelectorAll("nextjs-portal, [data-next-badge-root]").forEach((node) => {
        (node as HTMLElement).style.setProperty("display", "none", "important");
      });
    };
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
