/** A type-design construction drawing of the letter C — the hackathon poster artwork. */

const CX = 300;
const CY = 320;
const R_OUT = 212;
const R_IN = 122;
const R_MID = (R_OUT + R_IN) / 2;
const A = Math.PI / 4;

const pt = (r: number, angle: number) => [CX + r * Math.cos(angle), CY - r * Math.sin(angle)] as const;

function cShape(dx = 0, dy = 0) {
  const [ox1, oy1] = pt(R_OUT, A);
  const [ox2, oy2] = pt(R_OUT, -A);
  const [ix2, iy2] = pt(R_IN, -A);
  const [ix1, iy1] = pt(R_IN, A);
  return `M${ox1 + dx} ${oy1 + dy} A${R_OUT} ${R_OUT} 0 1 0 ${ox2 + dx} ${oy2 + dy} L${ix2 + dx} ${iy2 + dy} A${R_IN} ${R_IN} 0 1 1 ${ix1 + dx} ${iy1 + dy} Z`;
}

export function ConstructionC({ className = "" }: { className?: string }) {
  const [m1x, m1y] = pt(R_MID, A);
  const [m2x, m2y] = pt(R_MID, -A);
  const arcLen = Math.round(2 * Math.PI * R_MID * 0.75);
  const anchors = [pt(R_OUT, A), pt(R_IN, A), pt(R_OUT, -A), pt(R_IN, -A)];
  const handleA = pt(R_OUT, A);
  const handleB = [handleA[0] - 70, handleA[1] - 70] as const;
  const [rx, ry] = pt(R_OUT, Math.PI * 1.13);

  return (
    <svg viewBox="0 0 600 640" className={className} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="poster-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--paper-ink)" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="600" height="640" fill="url(#poster-grid)" />

      {/* construction geometry */}
      <g fill="none" stroke="var(--paper-ink)" strokeWidth="1" strokeOpacity="0.45">
        <circle cx={CX} cy={CY} r={R_OUT} strokeDasharray="4 5" />
        <circle cx={CX} cy={CY} r={R_IN} strokeDasharray="4 5" />
        <circle cx={CX} cy={CY} r={R_MID} strokeDasharray="1 6" />
        <path d={`M20 ${CY} H580 M${CX} 40 V600`} strokeOpacity="0.3" />
      </g>
      <g stroke="var(--cyan-ink)" strokeWidth="1.1" fill="none">
        <path d={`M${CX} ${CY} L${pt(R_OUT + 40, A).join(" ")}`} />
        <path d={`M${CX} ${CY} L${pt(R_OUT + 40, -A).join(" ")}`} />
        <path d={`M${pt(70, A).join(" ")} A70 70 0 0 1 ${pt(70, -A).join(" ")}`} />
      </g>
      <text x={CX + 82} y={CY + 4} fontFamily="var(--font-mono)" fontSize="12" fill="var(--cyan-ink)">
        90°
      </text>

      {/* the copy, shifted — every build starts as one */}
      <path d={cShape(16, -16)} fill="none" stroke="var(--paper-ink)" strokeWidth="1.2" strokeDasharray="6 5" strokeOpacity="0.55" />

      {/* the letter, drawn as one stroke */}
      <path
        d={`M${m1x} ${m1y} A${R_MID} ${R_MID} 0 1 0 ${m2x} ${m2y}`}
        fill="none"
        stroke="var(--violet-fill)"
        strokeWidth={R_OUT - R_IN}
        className="draw-line"
        style={{ strokeDasharray: arcLen, "--len": arcLen } as React.CSSProperties}
      />

      {/* vector anchors and a handle, like it's still open in an editor */}
      <path d={`M${handleA[0]} ${handleA[1]} L${handleB[0]} ${handleB[1]}`} stroke="var(--paper-ink)" strokeWidth="1" />
      <circle cx={handleB[0]} cy={handleB[1]} r="5" fill="var(--paper)" stroke="var(--paper-ink)" strokeWidth="1.2" />
      {anchors.map(([x, y], i) => (
        <rect
          key={i}
          x={x - 6}
          y={y - 6}
          width="12"
          height="12"
          fill={i === 0 ? "var(--lime)" : "var(--paper)"}
          stroke="var(--paper-ink)"
          strokeWidth="1.3"
        />
      ))}

      {/* centre + radius callouts */}
      <path d={`M${CX - 10} ${CY} H${CX + 10} M${CX} ${CY - 10} V${CY + 10}`} stroke="var(--paper-ink)" strokeWidth="1.3" />
      <path d={`M${CX} ${CY} L${rx} ${ry}`} stroke="var(--paper-ink)" strokeWidth="1" strokeOpacity="0.7" />
      <g fontFamily="var(--font-mono)" fontSize="12" fill="var(--paper-ink)">
        <text x={rx - 6} y={ry + 22} textAnchor="end">
          R {R_OUT}
        </text>
        <text x={CX + 14} y={CY - 14}>
          c₀
        </text>
        <text x="24" y="618" fillOpacity="0.6">
          CONSTRUCTION · DO NOT SCALE
        </text>
        <text x="576" y="618" textAnchor="end" fillOpacity="0.6">
          ∠ 270°
        </text>
      </g>
    </svg>
  );
}
