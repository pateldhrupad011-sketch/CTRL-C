import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/hackathon-auth";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { getCurrentParticipant } from "@/lib/participant-session";
import { isSubmissionUnlocked } from "@/lib/submit-unlock";
import { ProjectForm } from "../ProjectForm";

export const metadata: Metadata = {
  title: "Submit a project",
  description: "Hand in your Ctrl C hackathon project.",
};

async function SubmitContent() {
  const me = await getCurrentParticipant();
  if (!me) redirect("/hackathon");
  if (!(await isSubmissionUnlocked())) redirect("/hackathon");

  return (
    <div className="fall min-h-dvh">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <Link href="/hackathon" className="flex items-center gap-3">
            <Wordmark className="text-[1.7rem]" decorative />
            <span className="mono text-muted" aria-hidden="true">
              Submit
            </span>
            <span className="sr-only">Back to the hackathon page</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              Signed in as <span className="text-fg">{me.name}</span>
            </span>
            <form action={signOut}>
              <button type="submit" className="fall-ghost px-4">
                Sign out
              </button>
            </form>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <p className="mono text-[var(--pumpkin)]">Project desk</p>
        <h1 className="display-wide mt-3 text-[clamp(2.4rem,1rem+4vw,4rem)] leading-[0.95]">
          Submit a project
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          This page is only for handing in your work. One submission per team. Only the Ctrl C organizers can see it.
        </p>
        <div className="mt-12">
          <ProjectForm />
        </div>
      </main>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="fall min-h-dvh" />}>
      <SubmitContent />
    </Suspense>
  );
}