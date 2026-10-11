import { Suspense } from "react";
import { removeProject } from "@/actions/hackathon";
import { requireAdmin } from "@/lib/admin-auth";
import { getHackathonConfig } from "@/lib/hackathon-config";
import { listProjects } from "@/lib/projects";
import { listParticipants } from "@/lib/participants";
import { AdminBar, AdminLoading, HackathonTabs, SubmissionTabs, formatDate } from "../_components/ui";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { SubmissionCodeForm } from "./SubmissionCodeForm";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Projects />
    </Suspense>
  );
}

async function Projects() {
  const session = await requireAdmin();
  const [projects, signups, config] = await Promise.all([listProjects(), listParticipants(), getHackathonConfig()]);

  return (
    <>
      <AdminBar username={session.username} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Submissions</h1>
        <SubmissionTabs active="hackathon" />
        <HackathonTabs active="submissions" counts={{ submissions: projects.length, signups: signups.length }} />
        <SubmissionCodeForm code={config.submissionCode} />
        <p className="mt-10 text-muted">Projects teams submitted on the hackathon page.</p>

        {projects.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="font-medium">No projects yet.</p>
            <p className="mt-1 text-sm text-muted">When a signed-up team submits on /hackathon, it shows up here.</p>
          </div>
        ) : (
          <>
            <p className="mono mt-8 text-muted">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
            <ul className="mt-3 grid gap-6 md:grid-cols-2">
              {projects.map((p) => (
                <li key={p.id} className="overflow-hidden rounded-xl border border-line bg-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin-only route, not optimizable */}
                  <img
                    src={`/admin/projects/images/${p.image}`}
                    alt={`Cover image for ${p.teamName}`}
                    className="aspect-[16/10] w-full border-b border-line object-cover"
                  />
                  <div className="p-5">
                    <h2 className="font-display text-2xl font-bold break-words">{p.teamName}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Submitted {formatDate(p.createdAt)}
                      {p.submittedBy && (
                        <>
                          {" "}
                          by {p.submittedBy.name} ({p.submittedBy.email})
                        </>
                      )}
                    </p>

                    <dl className="mt-5 grid gap-4 text-sm">
                      <div>
                        <dt className="mono text-muted">Teammates</dt>
                        <dd className="mt-1">{p.teammates.join(", ")}</dd>
                      </div>
                      <div>
                        <dt className="mono text-muted">Description</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words">{p.description}</dd>
                      </div>
                      <div>
                        <dt className="mono text-muted">GitHub repo</dt>
                        <dd className="mt-1 break-all">
                          <a href={p.githubUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
                            {p.githubUrl}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="mono text-muted">Demo link</dt>
                        <dd className="mt-1 break-all">
                          <a href={p.demoUrl} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
                            {p.demoUrl}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="mono text-muted">AI Declaration</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words">{p.aiDeclaration}</dd>
                      </div>
                    </dl>

                    <form action={removeProject} className="mt-6 border-t border-line pt-4">
                      <input type="hidden" name="id" value={p.id} />
                      <DeleteProjectButton name={p.teamName} />
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
