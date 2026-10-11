import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { removeSubmission, saveNote, setStatus } from "@/actions/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { LIMITS, SUBMISSION_STATUSES, statusLabel } from "@/lib/interest";
import { getSubmission } from "@/lib/submissions";
import { AdminBar, AdminLoading, StatusBadge, formatDate } from "../../_components/ui";
import { DeleteButton } from "./DeleteButton";

type Params = Promise<{ id: string }>;

export default function SubmissionPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <SubmissionDetail params={params} />
    </Suspense>
  );
}

async function SubmissionDetail({ params }: { params: Params }) {
  const session = await requireAdmin();
  const { id } = await params;
  const item = await getSubmission(id);
  if (!item) notFound();

  return (
    <>
      <AdminBar username={session.username} />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/admin" className="text-sm text-muted hover:text-fg">
          ← All submissions
        </Link>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight break-words">{item.name}</h1>
            <p className="mt-1 text-sm text-muted">Received {formatDate(item.createdAt)}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <dl className="mt-8 divide-y divide-line rounded-xl border border-line">
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
            <dt className="mono text-muted">Email</dt>
            <dd className="min-w-0 break-words">
              <a href={`mailto:${item.email}`} className="underline underline-offset-4">
                {item.email}
              </a>
            </dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
            <dt className="mono text-muted">Phone</dt>
            <dd className="min-w-0 break-words">
              {item.phone ? (
                <a href={`tel:${item.phone.replace(/\s+/g, "")}`} className="underline underline-offset-4">
                  {item.phone}
                </a>
              ) : (
                <span className="text-faint">Not given</span>
              )}
            </dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
            <dt className="mono text-muted">LinkedIn</dt>
            <dd className="min-w-0 break-all">
              {item.linkedin ? (
                <a href={item.linkedin} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
                  {item.linkedin}
                </a>
              ) : (
                <span className="text-faint">Not given</span>
              )}
            </dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
            <dt className="mono text-muted">Website</dt>
            <dd className="min-w-0 break-all">
              {item.website ? (
                <a href={item.website} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
                  {item.website}
                </a>
              ) : (
                <span className="text-faint">Not given</span>
              )}
            </dd>
          </div>
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
            <dt className="mono text-muted">Resume</dt>
            <dd>
              {item.resume ? (
                <a href={`/admin/resumes/${item.resume}`} className="underline underline-offset-4">
                  Download resume
                </a>
              ) : (
                <span className="text-faint">Not given</span>
              )}
            </dd>
          </div>
          {item.interests.length > 0 && (
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
              <dt className="mono text-muted">Wants to</dt>
              <dd>{item.interests.join(", ")}</dd>
            </div>
          )}
          <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
            <dt className="mono text-muted">Message</dt>
            <dd className="whitespace-pre-wrap break-words">
              {item.message || <span className="text-faint">No message</span>}
            </dd>
          </div>
          {item.updatedAt !== item.createdAt && (
            <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_1fr]">
              <dt className="mono text-muted">Last updated</dt>
              <dd>{formatDate(item.updatedAt)}</dd>
            </div>
          )}
        </dl>

        <section aria-labelledby="status-title" className="mt-10">
          <h2 id="status-title" className="font-display text-xl font-bold">
            Status
          </h2>
          <form action={setStatus} className="mt-3 flex flex-wrap gap-2">
            <input type="hidden" name="id" value={item.id} />
            {SUBMISSION_STATUSES.map((s) => {
              const current = s === item.status;
              return (
                <button
                  key={s}
                  type="submit"
                  name="status"
                  value={s}
                  aria-pressed={current}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                    current ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:text-fg"
                  }`}
                >
                  {statusLabel[s]}
                </button>
              );
            })}
          </form>
        </section>

        <section aria-labelledby="note-title" className="mt-10">
          <h2 id="note-title" className="font-display text-xl font-bold">
            Internal note
          </h2>
          <p className="mt-1 text-sm text-muted">Only admins can see this.</p>
          <form action={saveNote} className="mt-3 grid gap-3">
            <input type="hidden" name="id" value={item.id} />
            <label htmlFor="note" className="sr-only">
              Internal note
            </label>
            <textarea
              id="note"
              name="note"
              rows={4}
              maxLength={LIMITS.note}
              defaultValue={item.note}
              placeholder="e.g. Emailed back, keen to mentor at the first event."
              className="field resize-y"
            />
            <div>
              <button type="submit" className="key">
                <span>Save note</span>
              </button>
            </div>
          </form>
        </section>

        <section aria-labelledby="danger-title" className="mt-14 border-t border-line pt-8">
          <h2 id="danger-title" className="font-display text-xl font-bold">
            Delete
          </h2>
          <p className="mt-1 text-sm text-muted">Removes this submission permanently. Use this if someone asks for their data to be deleted.</p>
          <form action={removeSubmission} className="mt-4">
            <input type="hidden" name="id" value={item.id} />
            <DeleteButton name={item.name} />
          </form>
        </section>
      </main>
    </>
  );
}
