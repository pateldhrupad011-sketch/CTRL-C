import type { Theme } from "@/lib/theme";

/** Night shift (dark) vs. daylight (light): same objects, different light. */
export type ScenePalette = {
  mat: string;
  matEdge: string;
  matGrid: string;
  matGridMajor: string;
  matInk: string;
  paper: string;
  paperInk: string;
  paperGrid: string;
  paperDim: string;
  keyCtrl: string;
  keyCtrlLegend: string;
  keyC: string;
  keyCLegend: string;
  pencil: string;
  wire: string;
  wireFill: string;
  wireFillOpacity: number;
  projection: string;
  ring: string;
  ringEmissive: number;
  trace: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  key: number;
  keyColor: string;
  rim: number;
  rimColor: string;
  env: number;
  envRim: number;
  ringGlow: number;
  contact: string;
  contactOpacity: number;
  ground: string;
  groundOpacity: number;
};

export const scenePalettes: Record<Theme, ScenePalette> = {
  dark: {
    mat: "#1a1920",
    matEdge: "#0f0e13",
    matGrid: "rgba(190, 180, 255, 0.10)",
    matGridMajor: "rgba(200, 190, 255, 0.24)",
    matInk: "rgba(239, 233, 221, 0.5)",
    paper: "#ebe6da",
    paperInk: "#2a2733",
    paperGrid: "rgba(40, 70, 160, 0.10)",
    paperDim: "#08737a",
    keyCtrl: "#2a2832",
    keyCtrlLegend: "#efe9dd",
    keyC: "#6a4bff",
    keyCLegend: "#ffffff",
    pencil: "#6a4bff",
    wire: "#b3a4ff",
    wireFill: "#7b5cff",
    wireFillOpacity: 0.07,
    projection: "#5ee0e6",
    ring: "#c6f432",
    ringEmissive: 0.1,
    trace: "#c6f432",
    hemiSky: "#d9d5ee",
    hemiGround: "#1a1420",
    hemi: 0.55,
    key: 2.6,
    keyColor: "#ffe9cc",
    rim: 2.2,
    rimColor: "#7b5cff",
    env: 0.9,
    envRim: 2.4,
    ringGlow: 0.9,
    contact: "#000000",
    contactOpacity: 0.75,
    ground: "#000000",
    groundOpacity: 0.7,
  },
  light: {
    mat: "#c4bcab",
    matEdge: "#a49b88",
    matGrid: "rgba(23, 21, 28, 0.10)",
    matGridMajor: "rgba(23, 21, 28, 0.24)",
    matInk: "rgba(23, 21, 28, 0.55)",
    paper: "#fdfbf6",
    paperInk: "#2a2733",
    paperGrid: "rgba(40, 70, 160, 0.10)",
    paperDim: "#08737a",
    keyCtrl: "#f6f2e9",
    keyCtrlLegend: "#1a1820",
    keyC: "#5b3df5",
    keyCLegend: "#ffffff",
    pencil: "#5b3df5",
    wire: "#5b3df5",
    wireFill: "#5b3df5",
    wireFillOpacity: 0.06,
    projection: "#0b8a92",
    ring: "#bdeb1f",
    ringEmissive: 0.06,
    trace: "#4d6b00",
    hemiSky: "#ffffff",
    hemiGround: "#d8ccb6",
    hemi: 1.15,
    key: 2.3,
    keyColor: "#fffaf0",
    rim: 0.9,
    rimColor: "#b9a8ff",
    env: 1.2,
    envRim: 1.0,
    ringGlow: 0.3,
    contact: "#3a2c1a",
    contactOpacity: 0.5,
    ground: "#4a3a24",
    groundOpacity: 0.32,
  },
};
