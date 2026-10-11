/**
 * Original placeholder artwork for the maker wall. Each sheet illustrates a
 * kind of work — none of them depict real Ctrl C projects or people.
 * Replace a sheet with a photo by swapping its contents for <Image>.
 */

const k = "text-[#b9abff]";
const f = "text-[#c6f432]";
const s = "text-[#5ee0e6]";
const c = "text-[#8c8792]";

export function CodeSheet() {
  const lines: React.ReactNode[] = [
    <><span className={c}>{"// iterate.ts"}</span></>,
    <><span className={k}>let</span> idea = <span className={f}>sketch</span>(<span className={s}>&quot;something new&quot;</span>);</>,
    <><span className={k}>let</span> version = <span className={s}>1</span>;</>,
    <>&nbsp;</>,
    <><span className={k}>while</span> (!idea.works) {"{"}</>,
    <>&nbsp;&nbsp;idea = <span className={f}>improve</span>(<span className={f}>copy</span>(idea));</>,
    <>&nbsp;&nbsp;version++;</>,
    <>{"}"}</>,
    <>&nbsp;</>,
    <><span className={f}>share</span>(idea); <span className={c}>{"// the fun part"}</span></>,
  ];
  return (
    <div className="aspect-[5/4] bg-[#141319] font-mono text-[clamp(0.68rem,0.55rem+0.4vw,0.86rem)] leading-[1.8] text-[#ebe6f5]">
      <div className="flex items-center gap-4 border-b border-white/10 px-4 py-2.5 text-[0.68rem] text-white/50">
        <span className="border-b border-[#c6f432] pb-1 text-white/85">iterate.ts</span>
        <span>notes.md</span>
      </div>
      <ol className="px-4 py-3">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-4 whitespace-pre">
            <span className="w-4 shrink-0 text-right text-white/25 select-none">{i + 1}</span>
            <span>{line}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function gearPath(cx: number, cy: number, teeth: number, rOut: number, rRoot: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const seq: [number, number][] = [
      [rRoot, a],
      [rOut, a + step * 0.18],
      [rOut, a + step * 0.48],
      [rRoot, a + step * 0.66],
    ];
    for (const [r, ang] of seq) {
      pts.push(`${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`);
    }
  }
  return `M${pts.join(" L")} Z`;
}

export function GearSheet() {
  const line = "rgb(225 232 255 / 0.85)";
  const faint = "rgb(225 232 255 / 0.25)";
  return (
    <div className="aspect-square bg-[var(--blueprint)]">
      <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="bp-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke={faint} strokeOpacity="0.45" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#bp-grid)" />
        <g fill="none" stroke={line} strokeWidth="1.4">
          <path d={gearPath(190, 185, 14, 120, 100)} />
          <circle cx="190" cy="185" r="34" />
          <rect x="183" y="146" width="14" height="10" />
          <circle cx="190" cy="185" r="68" strokeDasharray="5 5" stroke={faint} />
          {[0, 1, 2, 3].map((i) => {
            const a = (i * Math.PI) / 2 + Math.PI / 4;
            return <circle key={i} cx={190 + 68 * Math.cos(a)} cy={185 + 68 * Math.sin(a)} r="8" />;
          })}
        </g>
        <g stroke="#5ee0e6" strokeWidth="1" fill="none">
          <path d="M70 330 H310 M70 322 V338 M310 322 V338" />
          <path d="M190 40 V330" strokeDasharray="10 4 2 4" stroke={faint} />
          <path d="M45 185 H335" strokeDasharray="10 4 2 4" stroke={faint} />
        </g>
        <g fontFamily="var(--font-mono)" fontSize="11" fill={line}>
          <text x="190" y="352" textAnchor="middle" fill="#5ee0e6">
            Ø 240
          </text>
          <text x="20" y="30">14 T · M 3</text>
          <rect x="262" y="364" width="124" height="26" fill="none" stroke={line} strokeOpacity="0.6" />
          <text x="270" y="381" fontSize="9.5">
            SPUR GEAR · REV 3
          </text>
        </g>
      </svg>
    </div>
  );
}

export function TypeSheet() {
  const swatches = [
    { name: "Ink", hex: "#0C0B10", bg: "#0c0b10", fg: "#efe9dd" },
    { name: "Paper", hex: "#EFE9DD", bg: "#efe9dd", fg: "#1a1820" },
    { name: "Violet", hex: "#7B5CFF", bg: "#7b5cff", fg: "#fff" },
    { name: "Lime", hex: "#C6F432", bg: "#c6f432", fg: "#1a1820" },
    { name: "Cyan", hex: "#5EE0E6", bg: "#5ee0e6", fg: "#1a1820" },
  ];
  return (
    <div className="flex aspect-[5/4] flex-col bg-[var(--paper)] p-5 text-[var(--paper-ink)]">
      <div className="mono flex justify-between text-[0.6rem] text-[var(--paper-muted)]">
        <span>Specimen</span>
        <span>wdth 75 → 100</span>
      </div>
      <div className="flex flex-1 items-end gap-5">
        <span className="font-display text-[clamp(4.5rem,3rem+5vw,8rem)] leading-[0.8] font-[780] tracking-[-0.05em] [font-stretch:75%]">
          Aa
        </span>
        <span className="mb-1 font-display text-[clamp(2.4rem,1.6rem+2.5vw,4rem)] leading-[0.8] font-[300] tracking-[-0.03em] text-[var(--paper-muted)] [font-stretch:100%]">
          Aa
        </span>
      </div>
      <p className="mono mt-3 text-[0.6rem] text-[var(--paper-muted)]">Bricolage Grotesque · Geist · Geist Mono</p>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {swatches.map((sw) => (
          <div
            key={sw.name}
            className="flex aspect-[3/4] flex-col justify-end rounded-[2px] p-1.5 ring-1 ring-black/10"
            style={{ background: sw.bg, color: sw.fg }}
          >
            <span className="font-mono text-[0.52rem] leading-tight">
              {sw.name}
              <br />
              <span className="opacity-70">{sw.hex}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BreadboardSheet() {
  const cols = 30;
  const holes: React.ReactNode[] = [];
  const x0 = 30;
  const dx = 14;
  const rows = [34, 46, 84, 96, 108, 120, 132, 168, 180, 192, 204, 216, 254, 266];
  rows.forEach((y, r) =>
    Array.from({ length: cols }).forEach((_, i) => {
      if ((r < 2 || r > 11) && i % 6 === 5) return;
      holes.push(<rect key={`${r}-${i}`} x={x0 + i * dx - 2.5} y={y - 2.5} width="5" height="5" rx="1" fill="#2a2830" opacity="0.55" />);
    }),
  );
  return (
    <div className="aspect-[16/10] bg-[#f3efe6]">
      <svg viewBox="0 0 480 300" className="h-full w-full" aria-hidden="true">
        <rect x="14" y="14" width="452" height="272" rx="8" fill="#fbf9f4" stroke="#d9d2c3" />
        <path d="M24 26 H456 M24 274 H456" stroke="#7b5cff" strokeWidth="1.4" />
        <path d="M24 54 H456 M24 246 H456" stroke="#0b8a92" strokeWidth="1.4" />
        <rect x="24" y="146" width="432" height="10" fill="#ebe5d8" />
        {holes}
        {/* chip straddling the channel */}
        <rect x="254" y="126" width="62" height="52" rx="3" fill="#1d1c24" />
        <circle cx="262" cy="134" r="3" fill="#3a3842" />
        <text x="285" y="157" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#efe9dd">
          C-01
        </text>
        {/* resistor */}
        <path d="M100 108 H118" stroke="#8c8792" strokeWidth="2" />
        <path d="M156 108 H174" stroke="#8c8792" strokeWidth="2" />
        <rect x="118" y="101" width="38" height="14" rx="7" fill="#e3c99a" />
        <path d="M128 101v14M136 101v14M146 101v14" stroke="#7b5cff" strokeWidth="2.5" />
        {/* LED */}
        <path d="M212 96 V120 M222 96 V124" stroke="#8c8792" strokeWidth="2" />
        <path d="M206 96 a11 11 0 0 1 22 0 v4 h-22 z" fill="#c6f432" />
        <circle cx="217" cy="92" r="20" fill="#c6f432" opacity="0.18" />
        {/* jumpers */}
        <g fill="none" strokeWidth="4" strokeLinecap="round">
          <path d="M72 46 C72 70 86 84 86 96" stroke="#7b5cff" />
          <path d="M184 120 C190 80 240 70 268 126" stroke="#0b8a92" />
          <path d="M300 178 C320 230 380 230 394 254" stroke="#4d6b00" />
          <path d="M226 132 C230 190 160 200 156 216" stroke="#1d1c24" />
        </g>
      </svg>
    </div>
  );
}

export function CollabSheet() {
  return (
    <div className="relative aspect-square overflow-hidden bg-[var(--paper-2)] grid-field">
      <div className="absolute top-[10%] left-[8%] w-[56%] -rotate-[5deg] bg-[#d9f56e] p-4 text-[#1a1820] shadow-[0_10px_18px_-10px_rgb(0_0_0/0.45)]">
        <p className="font-display text-[clamp(1.05rem,0.8rem+0.9vw,1.5rem)] leading-[1.05] font-[650] [font-stretch:85%]">
          what if it folds flat?
        </p>
        <p className="mono mt-3 text-[0.55rem] text-black/55">idea · 01</p>
      </div>
      <div className="absolute top-[44%] right-[7%] w-[54%] rotate-[4deg] bg-[#6a4bff] p-4 text-white shadow-[0_10px_18px_-10px_rgb(0_0_0/0.5)]">
        <p className="font-display text-[clamp(1.05rem,0.8rem+0.9vw,1.5rem)] leading-[1.05] font-[650] [font-stretch:85%]">
          → try a hinge. v2?
        </p>
        <p className="mono mt-3 text-[0.55rem] text-white/65">reply · 02</p>
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 300" aria-hidden="true">
        <path d="M120 112 C150 140 160 150 176 136" fill="none" stroke="#1a1820" strokeWidth="1.5" strokeDasharray="3 4" />
        <g transform="translate(196 78)">
          <path d="M0 0 L0 20 L5 15 L9 24 L12 22.5 L8 14 L15 14 Z" fill="#1a1820" stroke="#fff" strokeWidth="1.2" />
          <rect x="14" y="20" width="30" height="15" rx="3" fill="#c6f432" />
          <text x="29" y="31" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#1a1820">
            you
          </text>
        </g>
        <g transform="translate(52 232)">
          <path d="M0 0 L0 20 L5 15 L9 24 L12 22.5 L8 14 L15 14 Z" fill="#1a1820" stroke="#fff" strokeWidth="1.2" />
          <rect x="14" y="20" width="62" height="15" rx="3" fill="#5ee0e6" />
          <text x="45" y="31" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#1a1820">
            a teammate
          </text>
        </g>
      </svg>
    </div>
  );
}

export function GraphSheet() {
  const data = [0.18, 0.12, 0.38, 0.3, 0.58, 0.5, 0.9];
  const X = (i: number) => 60 + i * 48;
  const Y = (v: number) => 250 - v * 200;
  const poly = data.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  return (
    <div className="aspect-[4/3] bg-[var(--paper)]">
      <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
        <defs>
          <pattern id="graph-grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0V12" fill="none" stroke="#0b8a92" strokeOpacity="0.16" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#graph-grid)" />
        <path d="M44 30 V258 H380" fill="none" stroke="#1a1820" strokeWidth="1.4" />
        <path d="M44 50 H380" stroke="#1a1820" strokeOpacity="0.35" strokeDasharray="4 4" />
        <polyline points={poly} fill="none" stroke="#1a1820" strokeWidth="1.5" strokeDasharray="5 4" />
        {data.map((v, i) => (
          <g key={i}>
            {i === data.length - 1 ? (
              <>
                <circle cx={X(i)} cy={Y(v)} r="14" fill="none" stroke="#6a4bff" strokeWidth="1.5" />
                <circle cx={X(i)} cy={Y(v)} r="6.5" fill="#c6f432" stroke="#1a1820" strokeWidth="1.3" />
              </>
            ) : (
              <path
                d={`M${X(i) - 4.5} ${Y(v) - 4.5} l9 9 M${X(i) + 4.5} ${Y(v) - 4.5} l-9 9`}
                stroke="#1a1820"
                strokeWidth="1.6"
              />
            )}
            <text x={X(i)} y="276" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#5f5a52">
              v{i + 1}
            </text>
          </g>
        ))}
        <g fontFamily="var(--font-mono)" fontSize="10" fill="#1a1820">
          <text x="50" y="44">it works →</text>
          <text x="380" y="292" textAnchor="end" fillOpacity="0.6">
            attempt
          </text>
          <text x={X(6) - 22} y={Y(0.9) - 22} textAnchor="end" fill="#6a4bff">
            finally.
          </text>
        </g>
      </svg>
    </div>
  );
}
