"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { EVENT_STATUSES, type EventStatus } from "@/content/events";
import { EVENT_LIMITS, saveEventFields } from "@/lib/site-event";

export type PublishState = { ok?: boolean; error?: string; at?: number };

export async function publishFeaturedEvent(_prev: PublishState, formData: FormData): Promise<PublishState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const dateLabel = String(formData.get("dateLabel") ?? "").trim();
  const locationLabel = String(formData.get("locationLabel") ?? "").trim();

  if (!title || !type || !description) return { error: "Title, type and description can’t be empty." };
  if (title.length > EVENT_LIMITS.title || type.length > EVENT_LIMITS.type || description.length > EVENT_LIMITS.description) {
    return { error: "One of the fields is too long." };
  }
  if (dateLabel.length > EVENT_LIMITS.date || locationLabel.length > EVENT_LIMITS.place) {
    return { error: "Date or place is too long." };
  }
  if (!EVENT_STATUSES.includes(status as EventStatus)) return { error: "Pick a status." };

  await saveEventFields({
    title,
    type,
    description,
    status: status as EventStatus,
    dateLabel,
    locationLabel,
  });
  revalidatePath("/");
  return { ok: true, at: Date.now() };
}
