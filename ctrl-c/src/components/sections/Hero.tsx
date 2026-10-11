import { hero } from "@/content/copy";
import { HeroStage } from "@/components/hero/HeroStage";
import { WorkbenchDrawing } from "@/components/hero/WorkbenchDrawing";
import { ScrambleText } from "@/components/motion/ScrambleText";

export function Hero() {
  const last = hero.headline.length - 1;

  return (
    <section id="top" aria-labelledby="hero-title" className="hero overflow-clip">
      <div className="hero__field grid-field" aria-hidden="true" />

      <div className="wrap relative grid grid-rows-[auto_auto_1fr_auto] pt-6 pb-10 md:pt-10 lg:min-h-[calc(min(100svh,1000px)-var(--header-h))] lg:grid-rows-[auto_1fr_auto] lg:pb-12">
        {/* metadata strip */}
        <div className="hero-fade mono relative z-10 flex items-start justify-between gap-6 text-muted">
          <p className="max-w-[44ch]">{hero.kicker}</p>
          <p className="hidden shrink-0 text-right sm:block" aria-hidden="true">
            <span className="text-fg">01</span> / 08 · {hero.revision}
          </p>
        </div>

        {/* headline — sits above the bench on large screens */}
        <h1
          id="hero-title"
          aria-label={hero.headline.join(" ")}
          className="display relative z-10 mt-10 text-[length:max(var(--step-hero),min(17vw,4.6rem))] md:mt-14 lg:col-start-1 lg:row-start-2 lg:mt-[clamp(2.5rem,8vh,5.5rem)] lg:max-w-[9ch]"
        >
          {hero.headline.map((line, i) => (
            <span key={line} className="hero-line" style={{ "--i": i } as React.CSSProperties}>
              {i === last ? (
                <span className="ghost-word" data-text={line}>
                  <ScrambleText text={line} delay={0.15 + i * 0.15} />
                </span>
              ) : (
                <ScrambleText text={line} delay={0.15 + i * 0.15} />
              )}
            </span>
          ))}
        </h1>

        {/* the bench */}
        <HeroStage
          drawing={<WorkbenchDrawing className="h-full w-full" />}
          className="relative -mx-[var(--gutter)] mt-4 aspect-[10/9] max-h-[560px] sm:aspect-[16/11] lg:absolute lg:inset-y-0 lg:right-[calc((100%-100vw)/2)] lg:mx-0 lg:mt-0 lg:aspect-auto lg:max-h-none lg:w-[calc(60%+(100vw-100%)/2)]"
        />

        {/* footing: description, actions, figure note */}
        <div className="relative z-10 mt-4 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:row-start-3 lg:mt-10">
          <div className="hero-fade max-w-[40rem]" style={{ "--i": 1 } as React.CSSProperties}>
            <p className="text-[length:var(--step-sm)] leading-[1.5] text-fg md:max-w-[34ch] md:text-[1.3rem]">
              {hero.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={hero.primaryAction.href} className="key key--primary min-w-[13rem] flex-1 sm:flex-none">
                {hero.primaryAction.label}
                <span className="key__hint" aria-hidden="true">
                  ↓ {hero.primaryAction.hint}
                </span>
              </a>
              <a href={hero.secondaryAction.href} className="key min-w-[13rem] flex-1 sm:flex-none">
                {hero.secondaryAction.label}
                <span className="key__hint" aria-hidden="true">
                  ↓ {hero.secondaryAction.hint}
                </span>
              </a>
            </div>
          </div>

          <figure
            className="hero-fade mono hidden text-right text-muted md:block"
            style={{ "--i": 2 } as React.CSSProperties}
            aria-hidden="true"
          >
            <figcaption className="text-fg">{hero.figure.label}</figcaption>
            <ol className="mt-2 flex justify-end gap-3">
              {hero.figure.steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  {step}
                  {i < hero.figure.steps.length - 1 && <span className="text-faint">→</span>}
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </div>
    </section>
  );
}
