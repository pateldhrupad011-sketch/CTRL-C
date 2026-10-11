import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { involve } from "@/content/copy";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register interest",
  description: "Tell Ctrl C how you’d like to take part.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-sunken">
      <header className="border-b border-line bg-bg">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Wordmark className="text-[1.7rem]" decorative />
            <span className="mono text-muted" aria-hidden="true">
              Register
            </span>
            <span className="sr-only">Back to the homepage</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <p className="mono text-faint">Get involved</p>
        <h1 className="display-wide mt-3 text-[clamp(2.4rem,1rem+4vw,4rem)] leading-[0.95]">
          {involve.form.heading}
        </h1>
        <p className="mt-4 max-w-xl text-[1.12rem] text-muted">{involve.form.intro}</p>
        <div className="mt-12 rounded-2xl border border-line bg-bg p-6 md:p-10">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
