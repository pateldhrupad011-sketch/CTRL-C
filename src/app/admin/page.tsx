import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";
import { SUBMISSION_STATUSES, type SubmissionStatus, statusLabel } from "@/lib/interest";
import { listSubmissions } from "@/lib/submissions";
import { AdminBar, AdminLoading, StatusBadge, SubmissionTabs, formatDate } from "./_components/ui";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function hrefFor(q: string, status: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

async function Dashboard({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireAdmin();
  const params = await searchParams;
  const q = first(params.q).trim();
  const statusParam = first(params.status);
  const status = SUBMISSION_STATUSES.includes(statusParam as SubmissionStatus)
    ? (statusParam as SubmissionStatus)
    : "";

  const all = await listSubmissions();
  const counts = Object.fromEntries(
    SUBMISSION_STATUSES.map((s) => [s, all.filter((item) => item.status === s).length]),
  ) as Record<SubmissionStatus, number>;

  const needle = q.toLowerCase();
  const visible = all.filter(
    (item) =>
      (!status || item.status === status) &&
      (!needle ||
        [item.name, item.email, item.phone ?? "", item.linkedin ?? "", item.website ?? "", item.message, item.note, ...item.interests].some((field) =>
          field.toLowerCase().includes(needle),
        )),
  );

  const tabs: { value: string; label: string; count: number }[] = [
    { value: "", label: "All", count: all.length },
    ...SUBMISSION_STATUSES.map((s) => ({ value: s, label: statusLabel[s], count: counts[s] })),
  ];

  return (
    <>
      <AdminBar username={session.username} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Submissions</h1>
        <SubmissionTabs active="involve" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <p className="text-muted">People who registered interest on /register.</p>
          {all.length > 0 && (
            <a href="/admin/export" className="key" download>
              <span>Export CSV</span>
              <span className="key__hint" aria-hidden="true">
                ↓
              </span>
            </a>
          )}
        </div>

        <nav aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab.value === status;
            return (
              <Link
                key={tab.label}
                href={hrefFor(q, tab.value)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:text-fg"
                }`}
              >
                {tab.label} <span className="tabular-nums opacity-70">{tab.count}</span>
              </Link>
            );
          })}
        </nav>

        <form action="/admin" className="mt-4 flex gap-2" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="admin-search" className="sr-only">
            Search submissions
          </label>
          <input
            id="admin-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search name, email, message…"
            className="field max-w-md"
          />
          <button type="submit" className="key">
            <span>Search</span>
          </button>
        </form>

        {visible.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="font-medium">
              {all.length === 0 ? "No submissions yet." : "Nothing matches that filter."}
            </p>
            <p className="mt-1 text-sm text-muted">
              {all.length === 0
                ? "When someone sends the interest form on the homepage, it shows up here."
                : "Try a different search or status."}
            </p>
            {all.length > 0 && (
              <Link href="/admin" className="mt-4 inline-block text-sm underline underline-offset-4">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="mono mt-8 text-muted" aria-live="polite">
              {visible.length} {visible.length === 1 ? "submission" : "submissions"}
            </p>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line">
              {visible.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/admin/submissions/${item.id}`}
                    className="grid gap-x-6 gap-y-1 px-5 py-4 transition-colors hover:bg-raised sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{item.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {item.email}
                        {item.phone ? ` · ${item.phone}` : ""}
                      </span>
                    </span>
                    <span className="truncate text-sm text-muted">{item.linkedin || item.website || item.interests.join(", ") || "—"}</span>
                    <span className="flex items-center gap-3 sm:justify-end">
                      <span className="text-sm whitespace-nowrap text-muted">{formatDate(item.createdAt)}</span>
                      <StatusBadge status={item.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  );
}
