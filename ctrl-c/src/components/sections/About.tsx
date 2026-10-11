import { about } from "@/content/copy";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { ScrollBend } from "@/components/motion/ScrollBend";

function PrincipleGlyph({ index }: { index: number }) {
  const common = {
    width: 56,
    height: 56,
    viewBox: "0 0 56 56",
    fill: "none",
    "aria-hidden": true,
    className: "text-fg",
  } as const;

  if (index === 0) {
    // a probe point: where a question lands
    return (
      <svg {...common}>
        <circle cx="28" cy="28" r="17" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="28" cy="28" r="5" fill="var(--lime)" />
        <path d="M28 4v10M28 42v10M4 28h10M42 28h10" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (index === 1) {
    // two keys, overlapping: one idea, two people
    return (
      <svg {...common}>
        <rect x="6" y="14" width="26" height="26" rx="4" stroke="currentColor" strokeWidth="1.2" />
        <rect x="22" y="8" width="26" height="26" rx="4" fill="var(--violet-fill)" />
        <rect x="22" y="8" width="26" height="26" rx="4" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
      </svg>
    );
  }
  // stacked versions: v1, v2, v3
  return (
    <svg {...common}>
      <path d="M8 40l20 8 20-8" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
      <path d="M8 31l20 8 20-8" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
      <path d="M8 22l20-8 20 8-20 8-20-8Z" stroke="currentColor" strokeWidth="1.2" fill="var(--lime)" fillOpacity="0.9" />
    </svg>
  );
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative py-24 md:py-36">
      <div className="wrap">
        <SectionMarker sheet="02" label="About" />

        <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <h2
            id="about-title"
            className="display-wide reveal text-[length:var(--step-lg)] lg:col-span-9"
          >
            {about.statement.before}
            <span className="mark">{about.statement.highlight}</span>
            {about.statement.after}
          </h2>

          <div className="reveal grid gap-10 md:grid-cols-2 lg:col-span-12 lg:grid-cols-12 lg:gap-8">
            <p className="prose-c text-[1.12rem] lg:col-span-5 lg:col-start-1">{about.body}</p>

            <aside
              aria-labelledby="name-title"
              className="relative border-l border-line pl-6 lg:col-span-4 lg:col-start-8"
            >
              <div className="mb-4 flex items-center gap-2" aria-hidden="true">
                <kbd className="cap">ctrl</kbd>
                <span className="mono text-faint">+</span>
                <kbd className="cap cap--c">C</kbd>
              </div>
              <h3 id="name-title" className="font-semibold text-fg">
                {about.name.title}
              </h3>
              <p className="mt-2 text-[0.98rem] text-muted">{about.name.body}</p>
            </aside>
          </div>
        </div>

        {/* principles: one connected process, not three cards */}
        <ScrollBend className="relative mt-24 md:mt-32">
          <svg
            className="pointer-events-none absolute top-0 left-0 hidden h-[190px] w-full md:block"
            viewBox="0 0 1000 190"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M40 28 H300 L340 108 H640 L680 188 H1000"
              fill="none"
              stroke="var(--lime-ink)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              className="draw-line"
              style={{ strokeDasharray: 1400, "--len": 1400 } as React.CSSProperties}
            />
          </svg>
          <span
            className="absolute top-0 bottom-0 left-[27px] w-px bg-lime-ink md:hidden"
            aria-hidden="true"
          />

          <ol className="relative grid gap-14 md:grid-cols-3 md:gap-10">
            {about.principles.map((p, i) => (
              <li
                key={p.title}
                className="relative md:[margin-top:calc(var(--step)*80px)]"
                style={{ "--step": i } as React.CSSProperties}
              >
                <div className="bend-item relative pl-20 md:pl-0">
                <div className="absolute top-0 left-0 grid size-14 place-items-center bg-bg md:relative">
                  <PrincipleGlyph index={i} />
                </div>
                <div className="md:mt-10">
                  <span className="principle__num block leading-none" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <h3 className="display mt-3 text-[length:var(--step-md)] md:mt-5">{p.title}</h3>
                  <p className="mt-3 max-w-[32ch] text-muted">{p.body}</p>
                </div>
                </div>
              </li>
            ))}
          </ol>
        </ScrollBend>
      </div>
    </section>
  );
}
