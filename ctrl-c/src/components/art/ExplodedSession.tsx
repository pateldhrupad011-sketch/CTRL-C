import { boxCorners, boxFaces, iso, path, points, type BoxSpec } from "@/lib/iso";

const S = 62;
const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);

type Layer = BoxSpec & { top: string; front: string; side: string; stroke: string; assembledY: number };

const layers: Layer[] = [
  {
    x: 0, z: 0, y: 3.25, w: 1.0, d: 1.0, h: 0.5, taper: 0.17, assembledY: 0.87,
    top: "var(--violet-fill)",
    front: "color-mix(in oklab, var(--violet-fill) 70%, #000)",
    side: "color-mix(in oklab, var(--violet-fill) 85%, #000)",
    stroke: "color-mix(in oklab, var(--violet-fill) 55%, #000)",
  },
  {
    x: 0, z: 0, y: 2.62, w: 0.24, d: 0.24, h: 0.32, assembledY: 0.92,
    top: "var(--fg)",
    front: "color-mix(in oklab, var(--fg) 70%, var(--bg))",
    side: "color-mix(in oklab, var(--fg) 85%, var(--bg))",
    stroke: "var(--line-strong)",
  },
  {
    x: 0, z: 0, y: 1.86, w: 0.84, d: 0.84, h: 0.44, taper: 0.06, assembledY: 0.43,
    top: "var(--key-face)",
    front: "color-mix(in oklab, var(--key-face) 78%, #000)",
    side: "color-mix(in oklab, var(--key-face) 90%, #000)",
    stroke: "var(--line-strong)",
  },
  {
    x: 0, z: 0, y: 1.18, w: 2.0, d: 2.0, h: 0.06, assembledY: 0.37,
    top: "var(--bg-raised)",
    front: "var(--bg-sunken)",
    side: "var(--bg-sunken)",
    stroke: "var(--line-strong)",
  },
  {
    x: 0, z: 0, y: 0.3, w: 2.25, d: 2.25, h: 0.07, assembledY: 0.3,
    top: "color-mix(in oklab, var(--bg-sunken) 85%, var(--violet))",
    front: "var(--bg-sunken)",
    side: "var(--bg-sunken)",
    stroke: "var(--line-strong)",
  },
];

/** How far each layer (by `data-part` index) sits above its assembled position, in SVG units. */
export const EXPLODE_OFFSETS = layers.map((l) => (l.y! - l.assembledY) * S);

/** SVG matrix that lays text on a vertical face facing +z, reading along +x. */
function frontTextMatrix(at: [number, number, number]) {
  const [tx, ty] = iso(at, S);
  return `matrix(${COS} ${SIN} 0 1 ${tx.toFixed(1)} ${ty.toFixed(1)})`;
}

function CapDetails({ layer, uid }: { layer: Layer; uid: string }) {
  const topY = layer.y! + layer.h;
  const topW = layer.w * (1 - (layer.taper ?? 0));
  const t = boxCorners(layer).top;
  const dish = boxCorners({ x: 0, z: 0, y: topY, w: topW * 0.78, d: topW * 0.78, h: 0 }).bottom;
  const legendAt = iso([-0.12, topY, 0.14], S);
  const legend = (dx: number, dy: number) =>
    `matrix(${COS} ${SIN} ${-COS} ${SIN} ${(legendAt[0] + dx).toFixed(1)} ${(legendAt[1] + dy).toFixed(1)})`;

  return (
    <>
      <polygon points={points(dish, S)} fill={`url(#${uid}-dish)`} stroke="color-mix(in oklab, var(--violet-fill) 70%, #000)" strokeWidth={0.6} />
      <path d={path([t[3], t[2], t[1]], S)} stroke="#fff" strokeOpacity={0.45} strokeWidth={1.1} fill="none" strokeLinejoin="round" />
      <path d={path([t[3], t[0], t[1]], S)} stroke="#000" strokeOpacity={0.18} strokeWidth={0.8} fill="none" strokeLinejoin="round" />
      <text transform={legend(1.2, 1.4)} fontFamily="var(--font-display)" fontWeight={800} fontSize={26} fill="#000" fillOpacity={0.28}>
        C
      </text>
      <text transform={legend(0, 0)} fontFamily="var(--font-display)" fontWeight={800} fontSize={26} fill="#fff">
        C
      </text>
      <text
        transform={frontTextMatrix([0, layer.y! + layer.h * 0.38, (layer.w / 2) * (1 - (layer.taper ?? 0) / 2)])}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={6.5}
        letterSpacing="0.22em"
        fill="#fff"
        fillOpacity={0.7}
      >
        COPY
      </text>
    </>
  );
}

type ExplodedSessionProps = {
  labels: readonly string[];
  className?: string;
  /** Numbers only, sized for narrow screens; the caller lists the labels in HTML. */
  compact?: boolean;
};

export function ExplodedSession({ labels, className = "", compact = false }: ExplodedSessionProps) {
  const uid = compact ? "es-c" : "es-f";
  const labelX = compact ? 150 : 168;
  const pcbY = layers[4].y! + layers[4].h;
  const traces = [
    path([[-0.9, pcbY, 0.6], [-0.2, pcbY, 0.6], [0, pcbY, 0.4]], S),
    path([[0.2, pcbY, -0.9], [0.2, pcbY, -0.3], [0.05, pcbY, -0.15]], S),
    path([[0.9, pcbY, 0.2], [0.35, pcbY, 0.2], [0.15, pcbY, 0]], S),
  ];
  const switchTop = layers[2].y! + layers[2].h;
  const stemSlot = [
    path([[-0.1, switchTop, 0], [0.1, switchTop, 0]], S),
    path([[0, switchTop, -0.1], [0, switchTop, 0.1]], S),
  ];
  const axisTop = iso([0, 4.2, 0], S);
  const axisBottom = iso([0, 0.1, 0], S);
  const capCenter = iso([0, layers[0].y! + layers[0].h / 2, 0], S);

  return (
    <svg
      viewBox={compact ? "-150 -270 335 360" : "-150 -270 560 360"}
      className={className}
      role="img"
      aria-label={`Exploded diagram of a build session, made of: ${labels.join(", ")}.`}
    >
      <defs>
        <linearGradient id={`${uid}-dish`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--violet-fill) 70%, #000)" />
          <stop offset="0.55" stopColor="var(--violet-fill)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--violet-fill) 75%, #fff)" />
        </linearGradient>
        <linearGradient id={`${uid}-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in oklab, var(--violet-fill) 78%, #000)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--violet-fill) 55%, #000)" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <path
        d={`M${axisTop[0]} ${axisTop[1]} L${axisBottom[0]} ${axisBottom[1]}`}
        stroke="var(--cyan-ink)"
        strokeWidth={0.9}
        strokeDasharray="4 5"
      />

      {[...layers].reverse().map((layer, ri) => {
        const i = layers.length - 1 - ri;
        const faces = boxFaces(layer, S);
        const hw = layer.w / 2;
        const anchor = iso([hw * (1 - (layer.taper ?? 0)), layer.y! + layer.h / 2, -hw * (1 - (layer.taper ?? 0))], S);
        return (
          <g key={i}>
            <g data-part={i}>
              <g {...(i === 0 ? { "data-float": true } : {})}>
                {i === 0 && (
                  <ellipse
                    data-glow
                    cx={capCenter[0]}
                    cy={capCenter[1]}
                    rx={58}
                    ry={40}
                    fill="var(--violet-fill)"
                    opacity={0}
                    filter={`url(#${uid}-glow)`}
                  />
                )}
                <g stroke={layer.stroke} strokeWidth={1} strokeLinejoin="round">
                  <polygon points={faces.front} fill={i === 0 ? `url(#${uid}-front)` : layer.front} />
                  <polygon points={faces.side} fill={layer.side} />
                  <polygon points={faces.top} fill={layer.top} />
                </g>
                {i === 0 && <CapDetails layer={layer} uid={uid} />}
                {i === 2 && (
                  <g stroke="var(--fg-muted)" strokeWidth={2.2} strokeLinecap="round">
                    {stemSlot.map((d, k) => (
                      <path key={k} d={d} />
                    ))}
                  </g>
                )}
                {i === 4 && (
                  <g stroke="var(--lime-ink)" strokeWidth={1.6} fill="none">
                    {traces.map((d, k) => (
                      <path key={k} d={d} />
                    ))}
                  </g>
                )}
              </g>
            </g>
            <g data-label={i}>
              <path
                d={`M${anchor[0] + 4} ${anchor[1]} H${labelX - 8}`}
                stroke="var(--fg-muted)"
                strokeWidth={0.8}
                strokeDasharray={i === 0 ? undefined : "1 3"}
              />
              <circle cx={anchor[0] + 4} cy={anchor[1]} r={2.4} fill="var(--fg)" />
              {compact ? (
                <text x={labelX} y={anchor[1] + 5} fontFamily="var(--font-mono)" fontSize={15} fill="var(--fg)">
                  0{i + 1}
                </text>
              ) : (
                <text x={labelX} y={anchor[1] + 4} fontFamily="var(--font-mono)" fontSize={11} fill="var(--fg-muted)" letterSpacing="0.06em">
                  <tspan fill="var(--fg)">0{i + 1}</tspan>
                  <tspan dx={8}>{labels[i]}</tspan>
                </text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
