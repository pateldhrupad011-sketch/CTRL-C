/** Isometric projection helpers for the procedural SVG drawings. World units, y up. */

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

export type V3 = [number, number, number];
export type V2 = [number, number];

export function iso([x, y, z]: V3, scale: number): V2 {
  return [(x - z) * COS * scale, ((x + z) * SIN - y) * scale];
}

export function points(list: V3[], scale: number) {
  return list
    .map((p) => {
      const [sx, sy] = iso(p, scale);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(" ");
}

export function path(list: V3[], scale: number, close = false) {
  const d = list
    .map((p, i) => {
      const [sx, sy] = iso(p, scale);
      return `${i === 0 ? "M" : "L"}${sx.toFixed(1)} ${sy.toFixed(1)}`;
    })
    .join(" ");
  return close ? `${d} Z` : d;
}

/** Rotate a point around a center in the ground (xz) plane. */
export function rotateXZ([x, y, z]: V3, [cx, cz]: [number, number], angle: number): V3 {
  const dx = x - cx;
  const dz = z - cz;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [cx + dx * c - dz * s, y, cz + dx * s + dz * c];
}

export type BoxSpec = {
  x: number;
  z: number;
  y?: number;
  w: number;
  d: number;
  h: number;
  /** 0..1 — how much the top face shrinks relative to the base (keycap profile). */
  taper?: number;
  rot?: number;
};

/** Corners of a tapered box: bottom then top, each [−x−z, +x−z, +x+z, −x+z]. */
export function boxCorners({ x, z, y = 0, w, d, h, taper = 0, rot = 0 }: BoxSpec) {
  const tw = (w * (1 - taper)) / 2;
  const td = (d * (1 - taper)) / 2;
  const bw = w / 2;
  const bd = d / 2;
  const ring = (hw: number, hd: number, yy: number): V3[] =>
    (
      [
        [x - hw, yy, z - hd],
        [x + hw, yy, z - hd],
        [x + hw, yy, z + hd],
        [x - hw, yy, z + hd],
      ] as V3[]
    ).map((p) => rotateXZ(p, [x, z], rot));
  return { bottom: ring(bw, bd, y), top: ring(tw, td, y + h) };
}

/** Visible faces for a viewer looking from +x +z: top, front (+z) and side (+x). */
export function boxFaces(spec: BoxSpec, scale: number) {
  const { bottom: b, top: t } = boxCorners(spec);
  return {
    top: points(t, scale),
    front: points([b[3], b[2], t[2], t[3]], scale),
    side: points([b[2], b[1], t[1], t[2]], scale),
  };
}

/** All 12 edges of a box as one path (for wireframe copies). */
export function boxEdges(spec: BoxSpec, scale: number) {
  const { bottom: b, top: t } = boxCorners(spec);
  const segs: [V3, V3][] = [
    [b[0], b[1]],
    [b[1], b[2]],
    [b[2], b[3]],
    [b[3], b[0]],
    [t[0], t[1]],
    [t[1], t[2]],
    [t[2], t[3]],
    [t[3], t[0]],
    [b[0], t[0]],
    [b[1], t[1]],
    [b[2], t[2]],
    [b[3], t[3]],
  ];
  return segs.map(([a, c]) => path([a, c], scale)).join(" ");
}

/** SVG matrix that lays text flat on the ground plane, reading along +x. */
export function groundTextMatrix([x, y, z]: V3, scale: number) {
  const [tx, ty] = iso([x, y, z], scale);
  return `matrix(${COS} ${SIN} ${-COS} ${SIN} ${tx.toFixed(1)} ${ty.toFixed(1)})`;
}
