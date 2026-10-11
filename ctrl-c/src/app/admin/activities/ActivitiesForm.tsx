"use client";

import { useActionState, useState } from "react";
import { publishActivities } from "@/actions/activities";
import { publishFeaturedEvent } from "@/actions/site-event";

type Activity = { part: string; title: string; body: string; status: string };
type EventFields = {
  title: string;
  type: string;
  description: string;
  status: string;
  dateLabel: string;
  locationLabel: string;
};

function StatusPicker({ name, value, options }: { name: string; value: string; options: readonly string[] }) {
  return (
    <fieldset>
      <legend className="mono text-muted">Status</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="cursor-pointer rounded-full border border-line-strong px-3.5 py-1.5 text-sm text-muted transition-colors has-[:checked]:border-fg has-[:checked]:bg-fg has-[:checked]:text-bg hover:text-fg has-[:checked]:hover:text-bg"
          >
            <input type="radio" name={name} value={option} defaultChecked={option === value} className="sr-only" required />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PublishBar({
  pending,
  state,
}: {
  pending: boolean;
  state: { ok?: boolean; error?: string; at?: number };
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button type="submit" className="key key--primary" disabled={pending}>
        <span>{pending ? "Publishing…" : "Publish to website"}</span>
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-[#d4553a]">
          {state.error}
        </p>
      )}
      {state.ok && !pending && (
        <p role="status" key={state.at} className="text-sm text-muted">
          Published. The homepage now shows this.
        </p>
      )}
    </div>
  );
}

function EventForm({
  event,
  statuses,
  limits,
}: {
  event: EventFields;
  statuses: readonly string[];
  limits: { title: number; type: number; description: number; date: number; place: number };
}) {
  const [state, action, pending] = useActionState(publishFeaturedEvent, {});

  return (
    <form action={action} className="grid gap-5 rounded-xl border border-line p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="mono text-muted">Title</span>
          <input name="title" defaultValue={event.title} maxLength={limits.title} className="field" required />
        </label>
        <label className="grid gap-1.5">
          <span className="mono text-muted">Type</span>
          <input name="type" defaultValue={event.type} maxLength={limits.type} className="field" required />
        </label>
      </div>
      <label className="grid gap-1.5">
        <span className="mono text-muted">What visitors read</span>
        <textarea
          name="description"
          defaultValue={event.description}
          maxLength={limits.description}
          rows={4}
          className="field"
          required
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="mono text-muted">Date (optional)</span>
          <input name="dateLabel" defaultValue={event.dateLabel} maxLength={limits.date} className="field" placeholder="e.g. 18 Oct" />
        </label>
        <label className="grid gap-1.5">
          <span className="mono text-muted">Place (optional)</span>
          <input
            name="locationLabel"
            defaultValue={event.locationLabel}
            maxLength={limits.place}
            className="field"
            placeholder="e.g. Main hall"
          />
        </label>
      </div>
      <StatusPicker name="status" value={event.status} options={statuses} />
      <PublishBar pending={pending} state={state} />
    </form>
  );
}

function nextPart(list: Activity[], max: number) {
  const used = new Set(list.map((a) => a.part));
  for (let i = 1; i <= max + 1; i++) {
    const part = `A${i}`;
    if (!used.has(part)) return part;
  }
  return `A${list.length + 1}`;
}

function ListForm({
  activities,
  statuses,
  limits,
}: {
  activities: Activity[];
  statuses: readonly string[];
  limits: { title: number; body: number; max: number };
}) {
  const [state, action, pending] = useActionState(publishActivities, {});
  const [list, setList] = useState(activities);

  return (
    <form action={action} className="grid gap-6">
      {list.map((a, index) => (
        <fieldset key={a.part} className="grid gap-4 rounded-lg border border-line p-5">
          <legend className="sr-only">Activity {a.part}</legend>
          <input type="hidden" name="part" value={a.part} />
          <div className="flex items-center justify-between gap-3">
            <span className="mono text-faint">{a.part}</span>
            {list.length > 1 && (
              <button
                type="button"
                className="text-sm text-muted underline decoration-line-strong underline-offset-4 hover:text-fg"
                onClick={() => setList((current) => current.filter((item) => item.part !== a.part))}
              >
                Remove
              </button>
            )}
          </div>
          <label className="grid gap-1.5">
            <span className="mono text-muted">Name</span>
            <input name={`${a.part}.title`} defaultValue={a.title} maxLength={limits.title} className="field" required />
          </label>
          <label className="grid gap-1.5">
            <span className="mono text-muted">Description</span>
            <textarea
              name={`${a.part}.body`}
              defaultValue={a.body}
              maxLength={limits.body}
              rows={3}
              className="field"
              required
            />
          </label>
          <StatusPicker name={`${a.part}.status`} value={a.status} options={statuses} />
          {index === 0 && <p className="text-sm text-muted">The first activity is the featured one on the homepage.</p>}
        </fieldset>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-line-strong text-2xl leading-none text-fg hover:bg-fg hover:text-bg"
          aria-label="Add activity"
          disabled={list.length >= limits.max}
          onClick={() =>
            setList((current) => [
              ...current,
              { part: nextPart(current, limits.max), title: "", body: "", status: "Planned" },
            ])
          }
        >
          +
        </button>
        <span className="text-sm text-muted">Add another activity</span>
      </div>
      <PublishBar pending={pending} state={state} />
    </form>
  );
}

export function ActivitiesForm({
  event,
  eventStatuses,
  eventLimits,
  activities,
  activityStatuses,
  activityLimits,
}: {
  event: EventFields;
  eventStatuses: readonly string[];
  eventLimits: { title: number; type: number; description: number; date: number; place: number };
  activities: Activity[];
  activityStatuses: readonly string[];
  activityLimits: { title: number; body: number; max: number };
}) {
  return (
    <div className="mt-8 grid gap-14">
      <section aria-labelledby="event-editor-title">
        <h2 id="event-editor-title" className="font-display text-2xl font-bold tracking-tight">
          Homepage event
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          This is the poster in the Events section, under Copy on the workbench. Type the copy, click a status, then
          publish. Visitors see that status on the site.
        </p>
        <div className="mt-6">
          <EventForm event={event} statuses={eventStatuses} limits={eventLimits} />
        </div>
      </section>

      <section aria-labelledby="activities-editor-title">
        <h2 id="activities-editor-title" className="font-display text-2xl font-bold tracking-tight">
          What we do
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          The activity list on the homepage. Edit the words, click a status, use + to add one or remove one, then
          publish.
        </p>
        <div className="mt-6">
          <ListForm activities={activities} statuses={activityStatuses} limits={activityLimits} />
        </div>
      </section>
    </div>
  );
}
