import { story } from "@/content/copy";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { ScrambleText } from "@/components/motion/ScrambleText";

export function Story() {
  const { log } = story;
  return (
    <section id="story" aria-labelledby="story-title" className="relative py-24 md:py-36">
      <div className="wrap">
        <SectionMarker sheet="06" label="Our story" note="Origin · commit 0000001" />

        <div className="mt-14 grid gap-14 md:mt-24 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <h2
              id="story-title"
              aria-label={story.heading}
              className="display text-[length:var(--step-xxl)]"
            >
              <ScrambleText text="Founded by" trigger="scroll" duration={1.6} />{" "}
              {story.founders.map((name, i) => (
                <span key={name} className="block text-violet-ink">
                  <ScrambleText
                    text={i === story.founders.length - 1 ? `${name}.` : name}
                    trigger="scroll"
                    duration={1.6}
                    delay={0.18 * (i + 1)}
                  />
                </span>
              ))}
            </h2>
            <div className="mt-10 grid max-w-[40rem] gap-5 text-[1.12rem] text-muted md:mt-14">
              {story.paragraphs.map((p, i) => (
                <p key={p}>
                  <ScrambleText text={p} trigger="scroll" block announce duration={2} delay={i * 0.2} />
                </p>
              ))}
            </div>
          </div>

          {/* the first commit, as an artifact */}
          <figure className="relative min-w-0 self-end lg:col-span-5">
            <div className="crops relative p-6 md:p-8">
              <pre className="mono-plain overflow-x-auto text-[0.98rem] leading-[1.8] whitespace-pre-wrap text-muted md:text-[1.12rem] lg:text-[1.18rem]">
                <span className="text-faint">
                  ${" "}
                  <ScrambleText text={log.command} trigger="scroll" announce duration={1} />
                </span>
                {"\n\n"}
                <span className="text-lime-ink">
                  <ScrambleText text={log.commit} trigger="scroll" announce duration={1.1} delay={0.15} />
                </span>
                {"\n"}
                {log.authors.map((name, i) => (
                  <span key={name}>
                    {i === 0 ? "Author: " : "        "}
                    <span className="text-fg">
                      <ScrambleText text={name} trigger="scroll" announce duration={1} delay={0.3 + i * 0.1} />
                    </span>
                    {i < log.authors.length - 1 && "\n"}
                  </span>
                ))}
                {"\n\n"}
                {log.message.map((m, i) => (
                  <span key={m} className={i === 0 ? "text-fg" : undefined}>
                    {"    "}
                    <ScrambleText text={m} trigger="scroll" announce duration={1.2} delay={0.45 + i * 0.15} />
                    {"\n"}
                  </span>
                ))}
                {"\n"}
                <span className="text-faint">
                  {"# "}
                  <ScrambleText text={log.next} trigger="scroll" announce duration={1.2} delay={0.8} />
                </span>
                <span className="cursor-blink text-lime-ink" aria-hidden="true" />
              </pre>
            </div>
            <figcaption className="sr-only">
              A git log styled note: the first commit of Ctrl C, authored by {log.authors.join(", ")}.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
