import Link from "next/link";
import { logout } from "@/actions/admin";
import { Wordmark } from "@/components/brand/Wordmark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { type SubmissionStatus, statusLabel } from "@/lib/interest";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

export function AdminBar({ username }: { username: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <Wordmark className="text-[1.7rem]" decorative />
          <span className="mono text-muted" aria-hidden="true">
            Admin
          </span>
          <span className="sr-only">Ctrl C admin home</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">
            Signed in as <span className="text-fg">{username}</span>
          </span>
          <ThemeToggle />
          <form action={logout}>
            <button type="submit" className="underline decoration-line-strong underline-offset-4 hover:decoration-fg">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

type Tab = { id: string; label: string; href: string; count?: number };

export function SubmissionTabs({ active }: { active: "involve" | "hackathon" | "activities" }) {
  return (
    <TabBar
      label="Submission type"
      active={active}
      tabs={[
        { id: "involve", label: "Get involved", href: "/admin" },
        { id: "hackathon", label: "Hackathon", href: "/admin/hackathon" },
        { id: "activities", label: "Activities", href: "/admin/activities" },
      ]}
    />
  );
}

export function HackathonTabs({
  active,
  counts,
}: {
  active: "submissions" | "signups";
  counts: { submissions: number; signups: number };
}) {
  return (
    <TabBar
      label="Hackathon"
      active={active}
      small
      tabs={[
        { id: "submissions", label: "Hackathon Submissions", href: "/admin/hackathon", count: counts.submissions },
        { id: "signups", label: "Hackathon Signups", href: "/admin/hackathon/signups", count: counts.signups },
      ]}
    />
  );
}

function TabBar({ label, active, tabs, small }: { label: string; active: string; tabs: Tab[]; small?: boolean }) {
  if (small) {
    return (
      <nav aria-label={label} className="mt-5 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const current = tab.id === active;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={current ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                current ? "border-fg bg-fg text-bg" : "border-line-strong text-muted hover:text-fg"
              }`}
            >
              {tab.label} <span className="tabular-nums opacity-70">{tab.count}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label={label} className="mt-6 flex gap-6 border-b border-line">
      {tabs.map((tab) => {
        const current = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={current ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              current ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="ml-1 tabular-nums opacity-60">{tab.count}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

const badgeTone: Record<SubmissionStatus, string> = {
  new: "bg-lime text-[#111]",
  "in-review": "bg-violet-fill text-white",
  contacted: "border border-line-strong text-fg",
  archived: "text-faint border border-line",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${badgeTone[status]}`}>
      {statusLabel[status]}
    </span>
  );
}

export function AdminLoading() {
  return (
    <p className="mono mx-auto max-w-5xl px-5 py-16 text-muted" role="status">
      Loading…
    </p>
  );
}
