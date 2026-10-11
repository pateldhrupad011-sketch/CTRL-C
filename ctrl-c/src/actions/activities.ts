"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ACTIVITY_LIMITS,
  ACTIVITY_STATUSES,
  type Activity,
  type ActivityStatus,
  saveActivities,
} from "@/lib/activities";

export type PublishState = { ok?: boolean; error?: string; at?: number };

export async function publishActivities(_prev: PublishState, formData: FormData): Promise<PublishState> {
  await requireAdmin();

  const parts = formData.getAll("part").filter((v): v is string => typeof v === "string" && v.trim().length > 0);
  if (parts.length === 0) return { error: "Keep at least one activity." };
  if (parts.length > ACTIVITY_LIMITS.max) return { error: `Keep it to ${ACTIVITY_LIMITS.max} activities.` };

  const next: Activity[] = [];
  const seen = new Set<string>();
  for (const raw of parts) {
    const part = raw.trim();
    if (seen.has(part)) return { error: `Duplicate part ${part}.` };
    seen.add(part);
    const title = String(formData.get(`${part}.title`) ?? "").trim();
    const body = String(formData.get(`${part}.body`) ?? "").trim();
    const status = String(formData.get(`${part}.status`) ?? "");
    if (!title || !body) return { error: `${part} needs a name and a description.` };
    if (title.length > ACTIVITY_LIMITS.title || body.length > ACTIVITY_LIMITS.body) {
      return { error: `${part} is too long.` };
    }
    if (!ACTIVITY_STATUSES.includes(status as ActivityStatus)) return { error: `Pick a status for ${part}.` };
    next.push({ part, title, body, status: status as ActivityStatus });
  }

  await saveActivities(next);
  revalidatePath("/");
  revalidatePath("/admin/activities");
  return { ok: true, at: Date.now() };
}
