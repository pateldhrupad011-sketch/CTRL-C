import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { listParticipants } from "@/lib/participants";
import { listProjects } from "@/lib/projects";
import { AdminBar, AdminLoading, HackathonTabs, SubmissionTabs, formatDate } from "../../_components/ui";

export default function SignupsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Signups />
    </Suspense>
  );
}

async function Signups() {
  const session = await requireAdmin();
  const [signups, projects] = await Promise.all([listParticipants(), listProjects()]);
  const submitted = new Set(projects.map((p) => p.submittedBy?.id).filter(Boolean));

  return (
    <>
      <AdminBar username={session.username} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Submissions</h1>
        <SubmissionTabs active="hackathon" />
        <HackathonTabs active="signups" counts={{ submissions: projects.length, signups: signups.length }} />
        <p className="mt-6 text-muted">People who created an account on the hackathon page.</p>

        {signups.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="font-medium">No sign-ups yet.</p>
            <p className="mt-1 text-sm text-muted">When someone signs up on /hackathon, they show up here.</p>
          </div>
        ) : (
          <>
            <p className="mono mt-8 text-muted">
              {signups.length} {signups.length === 1 ? "person" : "people"} signed up
            </p>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
              {signups.map((p) => (
                <li
                  key={p.id}
                  className="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{p.name}</span>
                    <a href={`mailto:${p.email}`} className="block truncate text-sm text-muted underline-offset-4 hover:underline">
                      {p.email}
                    </a>
                  </span>
                  <span className="text-sm whitespace-nowrap text-muted">Signed up {formatDate(p.createdAt)}</span>
                  <span className="sm:justify-self-end">
                    {submitted.has(p.id) ? (
                      <span className="inline-block rounded-full bg-lime px-2.5 py-0.5 text-xs font-medium text-[#111]">Submitted a project</span>
                    ) : (
                      <span className="inline-block rounded-full border border-line px-2.5 py-0.5 text-xs text-faint">No project yet</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
