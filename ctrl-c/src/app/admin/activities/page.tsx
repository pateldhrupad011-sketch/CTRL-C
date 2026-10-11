import { Suspense } from "react";
import { EVENT_STATUSES } from "@/content/events";
import { requireAdmin } from "@/lib/admin-auth";
import { ACTIVITY_LIMITS, ACTIVITY_STATUSES, getActivities } from "@/lib/activities";
import { EVENT_LIMITS, getEventFields } from "@/lib/site-event";
import { AdminBar, AdminLoading, SubmissionTabs } from "../_components/ui";
import { ActivitiesForm } from "./ActivitiesForm";

export default function ActivitiesPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Activities />
    </Suspense>
  );
}

async function Activities() {
  const session = await requireAdmin();
  const [event, activities] = await Promise.all([getEventFields(), getActivities()]);

  return (
    <>
      <AdminBar username={session.username} />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight">Activities</h1>
        <SubmissionTabs active="activities" />
        <p className="mt-6 max-w-2xl text-muted">
          Control what people see on the homepage: the event poster and the What we do list. Changes go live when you
          publish.
        </p>
        <ActivitiesForm
          event={event}
          eventStatuses={EVENT_STATUSES}
          eventLimits={EVENT_LIMITS}
          activities={activities}
          activityStatuses={ACTIVITY_STATUSES}
          activityLimits={ACTIVITY_LIMITS}
        />
      </main>
    </>
  );
}
