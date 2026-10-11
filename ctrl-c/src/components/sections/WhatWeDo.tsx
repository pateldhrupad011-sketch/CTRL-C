import { whatWeDo } from "@/content/copy";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { ExplodedSession } from "@/components/art/ExplodedSession";
import { ExplodeOnScroll } from "@/components/art/ExplodeOnScroll";
import { getActivities } from "@/lib/activities";

export async function WhatWeDo() {
  const [first, ...rest] = await getActivities();
  const featured = { ...whatWeDo.featured, ...first };
  const parts = rest.map((a) => ({
    ...whatWeDo.parts.find((p) => p.part === a.part),
    ...a,
    link: whatWeDo.parts.find((p) => p.part === a.part)?.link,
  }));

  return (
    <section
      id="what-we-do"
      aria-labelledby="wwd-title"
      className="relative border-t border-line bg-sunken py-24 md:py-32"
    >
      <div className="wrap">
        <SectionMarker sheet="03" label="What we do" note="Parts list · all planned" />

        <div className="mt-14 grid gap-8 md:mt-20 lg:grid-cols-12 lg:items-end">
          <h2 id="wwd-title" className="display reveal text-[length:var(--step-xxl)] lg:col-span-7">
            {whatWeDo.heading}
          </h2>
          <p className="prose-c reveal lg:col-span-4 lg:col-start-9">{whatWeDo.intro}</p>
        </div>

        {/* A1 — the dominant activity */}
        <article
          aria-labelledby="part-a1"
          className="reveal relative mt-16 grid gap-10 border-y border-line-strong py-10 md:mt-24 lg:grid-cols-12 lg:gap-8 lg:py-14"
        >
          <div className="flex flex-col lg:col-span-5">
            <div className="flex items-center gap-4">
              <span className="mono marker__num">{featured.part}</span>
              <span className={`status-chip ${featured.status !== "Planned" ? "status-chip--active" : ""}`}>
                {featured.status} · core activity
              </span>
            </div>
            <h3
              id="part-a1"
              className="display mt-8 text-[length:var(--step-xl)]"
            >
              {featured.title}
            </h3>
            <p className="mt-6 max-w-[36ch] text-[1.12rem] text-muted">{featured.body}</p>
            <p className="mono mt-auto hidden pt-10 text-faint lg:block" aria-hidden="true">
              {featured.figure}
            </p>
          </div>
          <figure className="reveal-late relative lg:col-span-7">
            <ExplodeOnScroll>
              <ExplodedSession labels={featured.parts} className="hidden h-auto w-full sm:block" />
              <ExplodedSession labels={featured.parts} compact className="h-auto w-full sm:hidden" />
            </ExplodeOnScroll>
            <ol className="mono-plain mt-6 grid gap-2 text-[0.82rem] text-muted sm:hidden" aria-hidden="true">
              {featured.parts.map((part, i) => (
                <li key={part} className="flex gap-3 border-t border-line pt-2">
                  <span className="text-fg">0{i + 1}</span>
                  {part}
                </li>
              ))}
            </ol>
            <figcaption className="mono mt-4 text-faint lg:hidden">{featured.figure}</figcaption>
          </figure>
        </article>

        {parts.length > 0 && (
        <div className="mt-6">
          <div
            className="mono hidden grid-cols-[4.5rem_minmax(12rem,1.1fr)_2fr_9rem] gap-6 pb-3 text-faint md:grid"
            aria-hidden="true"
          >
            <span>Part</span>
            <span>Activity</span>
            <span>What it is</span>
            <span>Status</span>
          </div>
          <ol aria-label="Other planned activities">
            {parts.map((p) => (
              <li key={p.part} className="bom-row reveal">
                <span className="mono pt-1 text-faint">{p.part}</span>
                <h3 className="display-wide text-[1.6rem] md:text-[1.9rem]">{p.title}</h3>
                <p className="col-start-2 text-muted md:col-start-auto">
                  {p.body}
                  {p.link && (
                    <>
                      {" "}
                      <a
                        href={p.link.href}
                        className="font-medium whitespace-nowrap text-fg underline decoration-lime-ink decoration-2 underline-offset-4 hover:decoration-fg"
                      >
                        {p.link.label} →
                      </a>
                    </>
                  )}
                </p>
                <span
                  className={`status-chip col-start-2 md:col-start-auto ${
                    p.status !== "Planned" ? "status-chip--active" : ""
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))}
          </ol>
        </div>
        )}
      </div>
    </section>
  );
}
