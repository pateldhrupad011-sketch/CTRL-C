/**
 * Shared composition for the hero workbench, in world units (1 = one keycap).
 * The WebGL scene and the SVG fallback drawing both read from here, so the
 * drawing is always a faithful "blueprint" of the 3D bench.
 *
 * Story, left to right: a sketch → the keys get built → copies lift off the
 * C key → the last copy has become something new.
 */

export const MAT = { w: 7.2, d: 4.6, t: 0.08 };

export const PAPER = { x: -2.1, z: -0.3, w: 2.0, d: 2.75, rot: 0.2 };

export const PENCIL = { x: -1.55, z: 0.75, length: 1.55, rot: -0.62 };

export const KEY_H = 0.56;
export const KEY_TAPER = 0.17;

export const CTRL_KEY = { x: -0.1, z: 0.45, w: 1.34, d: 1.06, h: KEY_H, taper: KEY_TAPER };
export const C_KEY = { x: 1.42, z: 0.45, w: 1.06, d: 1.06, h: KEY_H, taper: KEY_TAPER };

/** Wireframe copies stacked above the C key. `rot` is counter-clockwise seen from above. */
export const COPIES = [
  { y: 1.18, dx: 0.12, dz: -0.06, rot: 0.1 },
  { y: 1.9, dx: 0.27, dz: -0.14, rot: 0.24 },
];

/** The "remix": the final copy, now a solid C. */
export const RING = { y: 2.9, dx: 0.46, dz: -0.2, r: 0.48, tube: 0.155 };

/** Circuit traces on the mat (x, z). Pads are drawn at both ends. */
export const TRACES: [number, number][][] = [
  [
    [-1.12, 1.32],
    [-0.62, 1.32],
    [-0.44, 1.14],
  ],
  [
    [-1.12, 1.46],
    [-0.56, 1.46],
    [-0.3, 1.2],
  ],
  [
    [0.36, 1.14],
    [0.54, 1.32],
    [1.0, 1.32],
    [1.18, 1.14],
  ],
  [
    [2.1, 0.5],
    [2.52, 0.5],
    [2.86, 0.16],
    [2.86, -1.15],
  ],
];
