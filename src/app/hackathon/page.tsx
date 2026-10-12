import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PRIVACY_POLICY_URL, contact } from "@/content/site";
import { AuthPanel } from "./AuthPanel";

export const metadata: Metadata = {
  title: "Hackathon",
  description: "The Ctrl C hackathon: sign up, build something with your team, and submit your project.",
};

const LEAF = "M12 1.5c.9 2.3 2.4 3.6 4.4 3.9-.6 1.4-.5 2.6.4 3.6 1.3-.9 2.8-1.1 4.6-.6-.8 2-.6 3.6.8 4.8-2.4.5-3.9 1.7-4.4 3.6-1.5-.8-3-.9-4.6-.3l.6 6h-1.6l.6-6c-1.6-.6-3.1-.5-4.6.3-.5-1.9-2-3.1-4.4-3.6 1.4-1.2 1.6-2.8.8-4.8 1.8-.5 3.3-.3 4.6.6.9-1 1-2.2.4-3.6 2-.3 3.5-1.6 4.4-3.9Z";

const PRESSED = [
  { className: "top-6 right-[6%] w-16 rotate-[18deg] md:w-24", hue: "var(--pumpkin)" },
  { className: "top-40 right-[22%] hidden w-10 -rotate-[30deg] md:block", hue: "var(--mustard)" },
  { className: "bottom-10 left-[46%] hidden w-14 rotate-[110deg] lg:block", hue: "var(--maroon)" },
];

const FACTS = [
  { k: "When", v: "Date coming soon" },
  { k: "Where", v: "Venue coming soon" },
  { k: "Who", v: "Any student, any level" },
];

const STEPS = [
  { n: "1", title: "Make an account", body: "Name, email, password. That’s it. We won’t spam you." },
  { n: "2", title: "Find your people", body: "Come solo or bring up to five friends. Teams can change before you submit." },
  { n: "3", title: "Build your masterpiece", body: "Keep the code on GitHub and put a demo somewhere people can click it. Rough edges are expected." },
  { n: "4", title: "Hand it in", body: "Come back here, sign in and send us your links, a screenshot and an honest note on how you used AI." },
];

export default function HackathonPage() {
  return (
    <div className="fall min-h-dvh">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Wordmark className="text-[1.7rem]" decorative />
          <span className="mono text-muted" aria-hidden="true">
            Hackathon
          </span>
          <span className="sr-only">Back to the Ctrl C homepage</span>
        </Link>
        <div className="flex items-center gap-3">
          <a href="#join" className="fall-ghost px-4">
            Sign up
          </a>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <section aria-labelledby="hack-title" className="relative overflow-hidden">
          {PRESSED.map((leaf, i) => (
            <svg key={i} viewBox="0 0 24 26" className={`fall-pressed ${leaf.className}`} aria-hidden="true">
              <path d={LEAF} fill={leaf.hue} />
            </svg>
          ))}

          <div className="relative mx-auto grid max-w-6xl gap-14 px-5 pt-12 pb-20 md:pt-16 md:pb-28 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:pt-6">
              <p className="mono text-muted">
                Ctrl C presents <span className="text-[var(--pumpkin)]">/</span> Fall hackathon, first edition
              </p>
              <h1 id="hack-title" className="display mt-6 text-[clamp(3.2rem,1rem+6.5vw,7rem)] leading-[0.86]">
                Build
                <br />
                something
                <br />
                <span className="text-[var(--pumpkin)]">worth falling</span> for.
              </h1>
              <p className="mt-8 max-w-[34rem] text-[1.15rem] text-muted">
                A room full of students and whatever you can make before time runs out. You don’t need to be
                good at code. You need to <span className="fall-scribble text-fg">show up and try</span>.
              </p>

              <dl className="fall-stub mt-12 grid max-w-xl gap-4 sm:grid-cols-3 sm:gap-0">
                {FACTS.map((f, i) => (
                  <div key={f.k} className={i > 0 ? "sm:border-l sm:border-dashed sm:border-line-strong sm:pl-5" : "sm:pr-5"}>
                    <dt className="mono text-faint">{f.k}</dt>
                    <dd className="mt-1 font-medium">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div id="join" className="relative scroll-mt-6 lg:rotate-[0.6deg]">
              <span className="fall-tape -top-3 left-1/2 z-10 -translate-x-1/2 -rotate-3" aria-hidden="true" />
              <JoinCard />
            </div>
          </div>
        </section>

        <section aria-labelledby="how-title" className="fall-band">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="how-title" className="display-wide text-[clamp(2rem,1rem+3vw,3.2rem)] leading-[1]">
                How it works
              </h2>
              <p className="mono text-faint">Four steps, no fine print</p>
            </div>
            <ol className="mt-10 border-b border-line-strong">
              {STEPS.map((s) => (
                <li key={s.n} className="fall-step">
                  <span className="fall-step__num" aria-hidden="true">
                    {s.n}
                  </span>
                  <h3 className="text-[1.35rem] font-semibold">{s.title}</h3>
                  <p className="col-start-2 max-w-[46ch] text-muted md:col-start-auto">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
          <span>Put together by the Ctrl C team. Questions? Ask any of the organizers.</span>
          <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-line-strong underline-offset-4 hover:text-fg"
            >
              Privacy Policy
            </a>
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="underline decoration-line-strong underline-offset-4 hover:text-fg">
                {contact.email}
              </a>
            )}
            <Link href="/" className="underline decoration-line-strong underline-offset-4 hover:text-fg">
              Back to the homepage
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

function JoinCard() {
  return <AuthPanel />;
}
