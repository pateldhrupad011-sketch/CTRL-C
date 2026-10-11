"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTheme } from "@/lib/use-theme";
import { useFinePointer, useMediaQuery, useReducedMotion } from "@/lib/use-media";
import type { StageInput } from "./WorkbenchCanvas";

const WorkbenchCanvas = dynamic(() => import("./WorkbenchCanvas"), { ssr: false });

type Capability = "pending" | "webgl" | "static";

let cachedCapability: Capability | null = null;

/** Decide once per page load whether this device should get the WebGL bench. */
function detectCapability(): Capability {
  if (cachedCapability) return cachedCapability;
  const params = new URLSearchParams(window.location.search);
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  let ok = !params.has("static");
  if (ok && (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory < 4))) ok = false;
  if (ok) {
    try {
      const canvas = document.createElement("canvas");
      ok = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      ok = false;
    }
  }
  cachedCapability = ok ? "webgl" : "static";
  return cachedCapability;
}

const noopSubscribe = () => () => {};

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function HeroStage({ drawing, className = "" }: { drawing: ReactNode; className?: string }) {
  const capability = useSyncExternalStore<Capability>(noopSubscribe, detectCapability, () => "pending");
  const theme = useTheme();
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const compact = useMediaQuery("(max-width: 767px)");

  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<StageInput>({ px: 0, py: 0, scroll: 0 });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  const handleReady = useCallback(() => setReady(true), []);
  const handleFail = useCallback(() => {
    setFailed(true);
    setReady(false);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "80px 0px",
    });
    io.observe(el);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (reduced) {
      input.current = { px: 0, py: 0, scroll: 0 };
      return;
    }
    const hero = ref.current?.closest("section");
    const onPointer = (e: PointerEvent) => {
      input.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      input.current.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const h = hero?.offsetHeight ?? window.innerHeight;
      input.current.scroll = Math.min(1, Math.max(0, window.scrollY / h));
    };
    onScroll();
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced, finePointer]);

  const use3D = capability === "webgl" && !failed;
  const active = inView && pageVisible;
  const frameloop = !active ? "never" : reduced ? "demand" : "always";

  return (
    <div
      ref={ref}
      className={`hero-stage ${className}`}
      data-ready={use3D && ready}
      data-mode={capability === "pending" ? "pending" : use3D ? "webgl" : "static"}
      aria-hidden="true"
    >
      <div className="hero-stage__drawing">{drawing}</div>
      {use3D && (
        <SceneBoundary onError={handleFail}>
          <div className="hero-stage__canvas">
            <WorkbenchCanvas
              theme={theme}
              animate={!reduced}
              frameloop={frameloop}
              input={input}
              compact={compact}
              onReady={handleReady}
              onFail={handleFail}
            />
          </div>
        </SceneBoundary>
      )}
    </div>
  );
}
