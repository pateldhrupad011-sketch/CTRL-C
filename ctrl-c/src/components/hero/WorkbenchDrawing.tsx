import {
  boxCorners,
  boxEdges,
  boxFaces,
  groundTextMatrix,
  iso,
  path,
  points,
  rotateXZ,
  type V3,
} from "@/lib/iso";
import { COPIES, C_KEY, CTRL_KEY, KEY_H, MAT, PAPER, PENCIL, RING, TRACES } from "./layout";

const S = 76;

const hw = MAT.w / 2;
const hd = MAT.d / 2;

function paperPoint(u: number, v: number, y = 0.012): V3 {
  return rotateXZ([PAPER.x + u, y, PAPER.z + v], [PAPER.x, PAPER.z], PAPER.rot);
}

function Label({
  at,
  dx,
  dy,
  num,
  text,
  align = "start",
}: {
  at: V3;
  dx: number;
  dy: number;
  num: string;
  text: string;
  align?: "start" | "end";
}) {
  const [x, y] = iso(at, S);
  const ex = x + dx;
  const ey = y + dy;
  const tx = align === "start" ? ex + 8 : ex - 8;
  return (
    <g>
      <circle cx={x} cy={y} r={2.5} fill="var(--fg)" />
      <path d={`M${x} ${y} L${ex} ${ey}`} stroke="var(--fg-muted)" strokeWidth={0.8} />
      <text
        x={tx}
        y={ey + 3.5}
        textAnchor={align}
        fontFamily="var(--font-mono)"
        fontSize={10.5}
        letterSpacing="0.12em"
        fill="var(--fg-muted)"
      >
        <tspan fill="var(--fg)">{num}</tspan> {text.toUpperCase()}
      </text>
    </g>
  );
}

export function WorkbenchDrawing({ className = "" }: { className?: string }) {
  const matTop: V3[] = [
    [-hw, 0, -hd],
    [hw, 0, -hd],
    [hw, 0, hd],
    [-hw, 0, hd],
  ];
  const t = -MAT.t;
  const matFront: V3[] = [
    [-hw, 0, hd],
    [hw, 0, hd],
    [hw, t, hd],
    [-hw, t, hd],
  ];
  const matSide: V3[] = [
    [hw, 0, hd],
    [hw, 0, -hd],
    [hw, t, -hd],
    [hw, t, hd],
  ];

  const minor: string[] = [];
  const major: string[] = [];
  for (let x = -hw + 0.4; x < hw - 0.01; x += 0.4) {
    const isMajor = Math.abs((x + hw) % 1.2) < 0.01 || Math.abs(((x + hw) % 1.2) - 1.2) < 0.01;
    (isMajor ? major : minor).push(
      path(
        [
          [x, 0, -hd],
          [x, 0, hd],
        ],
        S,
      ),
    );
  }
  for (let z = -hd + 0.4; z < hd - 0.01; z += 0.4) {
    minor.push(
      path(
        [
          [-hw, 0, z],
          [hw, 0, z],
        ],
        S,
      ),
    );
  }

  const paper = [paperPoint(-1, -1.375), paperPoint(1, -1.375), paperPoint(1, 1.375), paperPoint(-1, 1.375)];
  const sketch = [
    path([paperPoint(-0.55, -0.15), paperPoint(0.55, -0.15), paperPoint(0.43, -0.62), paperPoint(-0.43, -0.62)], S, true),
    path([paperPoint(-0.42, 0.35), paperPoint(0.42, 0.35), paperPoint(0.42, 1.0), paperPoint(-0.42, 1.0)], S, true),
    path([paperPoint(-0.32, 0.45), paperPoint(0.32, 0.45), paperPoint(0.32, 0.9), paperPoint(-0.32, 0.9)], S, true),
  ];
  const dims = [
    path([paperPoint(-0.55, 0.05), paperPoint(0.55, 0.05)], S),
    path([paperPoint(-0.55, -0.02), paperPoint(-0.55, 0.12)], S),
    path([paperPoint(0.55, -0.02), paperPoint(0.55, 0.12)], S),
    path([paperPoint(0.72, -0.62), paperPoint(0.72, -0.15)], S),
    path([paperPoint(0.2, 1.12), paperPoint(0.88, 1.12), paperPoint(0.88, 1.3), paperPoint(0.2, 1.3)], S, true),
  ];

  const pencilA = rotateXZ([PENCIL.x - PENCIL.length / 2, 0.05, PENCIL.z], [PENCIL.x, PENCIL.z], PENCIL.rot);
  const pencilB = rotateXZ([PENCIL.x + PENCIL.length / 2 - 0.18, 0.05, PENCIL.z], [PENCIL.x, PENCIL.z], PENCIL.rot);
  const pencilTip = rotateXZ([PENCIL.x + PENCIL.length / 2, 0.05, PENCIL.z], [PENCIL.x, PENCIL.z], PENCIL.rot);

  const ctrl = boxFaces(CTRL_KEY, S);
  const cKey = boxFaces(C_KEY, S);
  const cTop = boxCorners(C_KEY).top;

  const copySpecs = COPIES.map((c) => ({
    ...C_KEY,
    x: C_KEY.x + c.dx,
    z: C_KEY.z + c.dz,
    y: c.y - C_KEY.h / 2,
    rot: c.rot,
  }));
  const lastCopyBottom = boxCorners(copySpecs[copySpecs.length - 1]).bottom;

  const ringCenter = iso([C_KEY.x + RING.dx, RING.y, C_KEY.z + RING.dz], S);
  const R = RING.r * S;
  const a = Math.PI / 4;
  const ringPath = `M${ringCenter[0] + R * Math.cos(a)} ${ringCenter[1] - R * Math.sin(a)} A${R} ${R} 0 1 0 ${
    ringCenter[0] + R * Math.cos(a)
  } ${ringCenter[1] + R * Math.sin(a)}`;

  const shadow = (spec: typeof CTRL_KEY) =>
    points(boxCorners({ ...spec, x: spec.x + 0.12, z: spec.z + 0.08, taper: 0 }).bottom, S);

  return (
    <svg
      className={className}
      viewBox="-440 -250 880 500"
      preserveAspectRatio="xMidYMid meet"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="wb-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* mat */}
      <polygon points={points(matFront, S)} fill="var(--bg-sunken)" stroke="var(--line-strong)" strokeWidth={1} />
      <polygon points={points(matSide, S)} fill="var(--bg-sunken)" stroke="var(--line-strong)" strokeWidth={1} />
      <polygon points={points(matTop, S)} fill="var(--bg-raised)" stroke="var(--line-strong)" strokeWidth={1} />
      <path d={minor.join(" ")} stroke="var(--line)" strokeWidth={0.75} fill="none" />
      <path d={major.join(" ")} stroke="var(--line-strong)" strokeWidth={0.75} fill="none" />
      <path
        d={path(
          [
            [-hw, 0, hd],
            [-hw + 2.6, 0, hd - 2.6],
          ],
          S,
        )}
        stroke="var(--line-strong)"
        strokeWidth={0.75}
        strokeDasharray="2 4"
      />

      {/* paper sketch */}
      <polygon points={points(paper, S)} fill="var(--paper)" />
      <g stroke="var(--paper-ink)" fill="none" strokeWidth={1} opacity={0.75}>
        {sketch.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g stroke="var(--cyan-ink)" fill="none" strokeWidth={0.9} opacity={0.9}>
        {dims.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* pencil */}
      <path
        d={path([pencilA, pencilB], S)}
        stroke="var(--violet-fill)"
        strokeWidth={8}
        strokeLinecap="butt"
      />
      <path d={path([pencilB, pencilTip], S)} stroke="#d8b98a" strokeWidth={6} strokeLinecap="round" />

      {/* traces */}
      <g stroke="var(--lime-ink)" strokeWidth={1.8} fill="none" strokeLinejoin="round">
        {TRACES.map((tr, i) => (
          <path key={i} d={path(tr.map(([x, z]) => [x, 0.002, z] as V3), S)} />
        ))}
      </g>
      <g fill="var(--lime-ink)">
        {TRACES.flatMap((tr, i) =>
          [tr[0], tr[tr.length - 1]].map(([x, z], j) => {
            const [sx, sy] = iso([x, 0.002, z], S);
            return <ellipse key={`${i}-${j}`} cx={sx} cy={sy} rx={4.5} ry={2.6} />;
          }),
        )}
      </g>

      {/* shadows */}
      <g filter="url(#wb-soft)" fill="#000" opacity={0.35}>
        <polygon points={shadow(CTRL_KEY)} />
        <polygon points={shadow(C_KEY)} />
      </g>

      {/* ctrl key */}
      <g stroke="var(--line-strong)" strokeWidth={1} strokeLinejoin="round">
        <polygon points={ctrl.front} fill="color-mix(in oklab, var(--key-face) 80%, #000)" />
        <polygon points={ctrl.side} fill="color-mix(in oklab, var(--key-face) 90%, #000)" />
        <polygon points={ctrl.top} fill="var(--key-face)" />
      </g>
      <text
        transform={groundTextMatrix([CTRL_KEY.x - 0.42, CTRL_KEY.h + 0.001, CTRL_KEY.z + 0.32], S)}
        fontFamily="var(--font-display)"
        fontWeight={700}
        fontSize={17}
        fill="var(--fg)"
      >
        Ctrl
      </text>

      {/* c key */}
      <g stroke="color-mix(in oklab, var(--violet-fill) 60%, #000)" strokeWidth={1} strokeLinejoin="round">
        <polygon points={cKey.front} fill="color-mix(in oklab, var(--violet-fill) 72%, #000)" />
        <polygon points={cKey.side} fill="color-mix(in oklab, var(--violet-fill) 86%, #000)" />
        <polygon points={cKey.top} fill="var(--violet-fill)" />
      </g>
      <text
        transform={groundTextMatrix([C_KEY.x - 0.14, C_KEY.h + 0.001, C_KEY.z + 0.17], S)}
        fontFamily="var(--font-display)"
        fontWeight={800}
        fontSize={30}
        fill="#fff"
      >
        C
      </text>

      {/* projection lines from the original to its copies */}
      <g stroke="var(--cyan-ink)" strokeWidth={0.9} strokeDasharray="3 4" opacity={0.85}>
        <path d={path([cTop[0], lastCopyBottom[0]], S)} />
        <path d={path([cTop[2], lastCopyBottom[2]], S)} />
        <path d={path([cTop[1], lastCopyBottom[1]], S)} />
      </g>

      {/* copies */}
      {copySpecs.map((spec, i) => (
        <g key={i}>
          <polygon points={boxFaces(spec, S).top} fill="var(--violet)" opacity={0.1} />
          <path
            d={boxEdges(spec, S)}
            stroke="var(--violet-ink)"
            strokeWidth={1.2}
            fill="none"
            strokeDasharray={i === 1 ? "5 4" : undefined}
            opacity={i === 0 ? 0.95 : 0.7}
          />
        </g>
      ))}

      {/* remix */}
      <circle
        cx={ringCenter[0]}
        cy={ringCenter[1]}
        r={R}
        fill="none"
        stroke="var(--cyan-ink)"
        strokeWidth={0.8}
        strokeDasharray="2 4"
      />
      <path d={ringPath} fill="none" stroke="var(--lime)" strokeWidth={RING.tube * 2 * S} strokeLinecap="round" />
      <path
        d={`M${ringCenter[0] - 6} ${ringCenter[1]} H${ringCenter[0] + 6} M${ringCenter[0]} ${ringCenter[1] - 6} V${ringCenter[1] + 6}`}
        stroke="var(--fg-muted)"
        strokeWidth={0.8}
      />

      <Label at={paperPoint(-0.9, -1.2)} dx={-40} dy={-36} num="01" text="Sketch" align="end" />
      <Label at={[CTRL_KEY.x - 0.45, KEY_H * 0.4, CTRL_KEY.z + 0.5]} dx={-64} dy={40} num="02" text="Build" align="end" />
      <Label at={[C_KEY.x + 0.6, COPIES[0].y, C_KEY.z - 0.3]} dx={56} dy={-10} num="03" text="Copy" />
      <Label
        at={[C_KEY.x + RING.dx + RING.r + 0.1, RING.y, C_KEY.z + RING.dz]}
        dx={46}
        dy={-22}
        num="04"
        text="Remix"
      />
    </svg>
  );
}
