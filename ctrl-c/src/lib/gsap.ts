"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Web fonts reflow the page after ScrollTrigger first measures it.
if (typeof document !== "undefined") document.fonts?.ready.then(() => ScrollTrigger.refresh());

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
