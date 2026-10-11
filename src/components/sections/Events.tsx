import Link from "next/link";
import { eventsCopy } from "@/content/copy";
import { type CtrlEvent } from "@/content/events";
import { isExternal } from "@/content/site";
import { getFeaturedEvent } from "@/lib/site-event";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { ConstructionC } from "@/components/art/ConstructionC";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { Float } from "@/components/motion/Float";

function EventAction({ event }: { event: CtrlEvent }) {
  if (event.href) {
    const external = isExternal(event.href);
    return (
      <Link
        href={event.href}
        className="key key--primary min-w-[15rem]"
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        <span>
          View event details
          {external && <span className="sr-only"> (opens in a new tab)</span>}
        </span>
        <span className="key__hint" aria-hidden="true">
          {external ? "↗" : "→"}
        </span>
      </Link>
    );
  }
  return (
    <p className="mono inline-flex items-center gap-3 border-y border-dashed border-line-strong py-3 text-fg">
      <span className="status-chip status-chip--active">{event.status}</span>
      <span className="text-faint" aria-hidden="true">
        /
      </span>
      <span>{eventsCopy.pendingLink}</span>
    </p>
  );
}

function Poster({ event }: { event?: CtrlEvent }) {
  const meta = [
    event?.dateLabel && { k: "Date", v: event.dateLabel },
    event?.locationLabel && { k: "Place", v: event.locationLabel },
  ].filter(Boolean) as { k: string; v: string }[];

  return (
    <div className="relative">
      <div className="poster-copy translate-x-4 -translate-y-4 rotate-[1.2deg] md:translate-x-6 md:-translate-y-6" aria-hidden="true" />
      <Float distance={16} sway={1.1} duration={3.4} className="relative">
        <div className="poster -rotate-[1.4deg] overflow-clip">
          {/* file tab */}
          <div className="mono flex items-center justify-between gap-4 border-b border-paper-ink/15 px-5 py-3.5 text-[0.66rem] text-paper-ink/70">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-violet-fill" aria-hidden="true" />
              <span className="truncate normal-case tracking-[0.04em]">
                {event ? eventsCopy.posterFile : "untitled-event"}
                <span className="text-paper-ink/45">.ctrlc · {eventsCopy.posterFileNote}</span>
              </span>
            </span>
            <span className="shrink-0">EVT · {event ? "001" : "TBA"}</span>
          </div>

          <ConstructionC className="block h-auto w-full" />

          <div className="px-5 pb-5 md:px-7 md:pb-7">
            <p className="display -mt-3 text-[clamp(3.2rem,9vw,6.4rem)] leading-[0.82] md:-mt-6">
              {event?.type ?? "Untitled"}
            </p>
            <p className="mono mt-3 text-paper-ink/65">
              {meta.length === 0 ? eventsCopy.posterNameNote : meta.map((m) => `${m.k}: ${m.v}`).join(" · ")}
            </p>

            <dl className="mono mt-6 grid grid-cols-3 border-t border-paper-ink/20 text-[0.62rem] md:text-[0.66rem]">
              <div className="border-r border-paper-ink/20 py-3 pr-3">
                <dt className="text-paper-ink/55">Type</dt>
                <dd className="mt-1 text-paper-ink">{event?.type ?? "TBA"}</dd>
              </div>
              <div className="border-r border-paper-ink/20 px-3 py-3">
                <dt className="text-paper-ink/55">Status</dt>
                <dd className="mt-1 text-paper-ink">
                  {event ? event.status : "Nothing yet"}
                  <span className="cursor-blink" aria-hidden="true" />
                </dd>
              </div>
              <div className="py-3 pl-3">
                <dt className="text-paper-ink/55">Sheet</dt>
                <dd className="mt-1 text-paper-ink">04 / 08</dd>
              </div>
            </dl>
          </div>
        </div>
      </Float>
    </div>
  );
}

export async function Events() {
  const featured = await getFeaturedEvent();
  const heading = featured ? eventsCopy.heading : eventsCopy.emptyHeading;

  return (
    <section id="events" aria-labelledby="events-title" className="relative overflow-clip py-24 md:py-36">
      <div className="grid-field pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)]" aria-hidden="true" />

      <div className="wrap relative">
        <SectionMarker sheet="04" label="Events" note="Announcement pending" />

        <div className="mt-14 grid gap-16 md:mt-20 lg:grid-cols-12 lg:gap-6">
          <div className="relative z-10 flex flex-col lg:col-span-7 lg:justify-between lg:py-6">
            <div>
              <p className="mono text-lime-ink">
                {featured ? `${featured.type} · ${featured.status}` : "Events"}
              </p>
              <h2
                id="events-title"
                aria-label={heading.join(" ")}
                className="display reveal mt-6 text-[length:var(--step-hero)]"
              >
                {heading.map((line, i) => (
                  <span key={line} className="block">
                    <ScrambleText text={line} trigger="scroll" delay={i * 0.15} />
                  </span>
                ))}
              </h2>
            </div>

            <div className="reveal mt-10 max-w-[30rem] lg:mt-14">
              {featured ? (
                <>
                  <h3 className="text-[1.25rem] font-semibold">{featured.title}</h3>
                  <p className="mt-2 text-[1.12rem] text-muted">{featured.description}</p>
                  <div className="mt-8">
                    <EventAction event={featured} />
                  </div>
                </>
              ) : (
                <p className="text-[1.12rem] text-muted">{eventsCopy.emptyBody}</p>
              )}
            </div>
          </div>

          <div className="reveal relative mx-auto w-full max-w-[34rem] pr-6 pl-2 sm:px-0 lg:col-span-5 lg:mt-0 lg:max-w-none">
            {featured?.href ? (
              <Link
                href={featured.href}
                aria-label={`${featured.title}: view event details`}
                className="block rounded-xl"
                {...(isExternal(featured.href) ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <Poster event={featured} />
              </Link>
            ) : (
              <Poster event={featured} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
