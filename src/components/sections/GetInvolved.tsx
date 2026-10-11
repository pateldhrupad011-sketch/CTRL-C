import { involve } from "@/content/copy";
import { getInvolvementLinks, isExternal } from "@/content/site";

export function GetInvolved() {
  const links = getInvolvementLinks();

  return (
    <section id="get-involved" aria-labelledby="involve-title" className="involve relative overflow-clip py-24 md:py-32">
      <svg
        className="pointer-events-none absolute -top-24 -right-24 h-[34rem] w-[34rem] opacity-[0.16] md:-right-10"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="96" fill="none" stroke="#fff" strokeWidth="0.6" strokeDasharray="2 3" />
        <circle cx="100" cy="100" r="62" fill="none" stroke="#fff" strokeWidth="0.6" />
        <path d="M100 0V200M0 100H200" stroke="#fff" strokeWidth="0.4" />
      </svg>

      <div className="wrap relative">
        <div className="marker mono">
          <span className="marker__num" aria-hidden="true">
            07
          </span>
          <span className="text-fg">Get involved</span>
          <span className="marker__rule draw-x" aria-hidden="true" />
          <span className="hidden sm:inline" aria-hidden="true">
            Sheet 07 / 08
          </span>
        </div>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <h2 id="involve-title" className="display reveal text-[length:var(--step-xxl)] lg:col-span-8">
            {involve.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="reveal max-w-[34ch] text-[1.12rem] text-muted lg:col-span-4 lg:self-end">{involve.intro}</p>
        </div>

        <div className="mt-16 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <ul className="lg:col-span-8" aria-label="Ways to take part">
            {involve.ways.map((w, i) => (
              <li key={w.word} className="involve-row reveal">
                <p className="involve-word flex items-start gap-3">
                  <span className="mono mt-[0.55em] w-6 shrink-0 text-[0.7rem] leading-none tracking-[0.1em] text-muted" aria-hidden="true">
                    0{i + 1}
                  </span>
                  {w.word}
                </p>
                <p className="max-w-[34ch] text-muted">{w.body}</p>
              </li>
            ))}
          </ul>

          <aside aria-labelledby="involve-status" className="reveal lg:col-span-4">
            <div className="crops p-6 md:p-8" style={{ "--c": "rgb(255 255 255 / 0.5)" } as React.CSSProperties}>
              <h3 id="involve-status" className="display-wide text-[1.75rem] leading-[1.1]">
                {involve.form.heading}
              </h3>
              <p className="mt-3 text-muted">{involve.form.intro}</p>
              <a href="/register" className="key mt-8 w-full">
                <span>Register interest</span>
                <span className="key__hint" aria-hidden="true">
                  →
                </span>
              </a>
              {links.length > 0 && (
                <div className="mt-8 border-t border-line pt-6">
                  <p className="mono text-muted">Elsewhere</p>
                  <ul className="mt-4 grid gap-3">
                    {links.map((link) => {
                      const external = isExternal(link.href);
                      return (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            className="key w-full"
                            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                          >
                            <span>
                              {link.label}
                              {external && <span className="sr-only"> (opens in a new tab)</span>}
                            </span>
                            <span className="key__hint" aria-hidden="true">
                              {link.note ?? "↗"}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
