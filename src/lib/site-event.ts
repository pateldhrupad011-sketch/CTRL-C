import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { EVENT_STATUSES, events, type CtrlEvent, type EventStatus } from "@/content/events";
import { db } from "./firebase";

export const EVENT_LIMITS = { title: 80, type: 40, description: 400, date: 40, place: 80 };

export type EventFields = {
  title: string;
  type: string;
  description: string;
  status: EventStatus;
  dateLabel: string;
  locationLabel: string;
};

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "featured-event.json");
const FALLBACK = events[0];

const LEGACY: Record<string, EventStatus> = {
  "in-the-works": "In the works",
  announced: "Announced",
  past: "Finished",
};

function asStatus(value: unknown): EventStatus | null {
  if (typeof value !== "string") return null;
  if (EVENT_STATUSES.includes(value as EventStatus)) return value as EventStatus;
  return LEGACY[value] ?? null;
}

function fieldsFrom(event: CtrlEvent): EventFields {
  return {
    title: event.title,
    type: event.type,
    description: event.description,
    status: event.status,
    dateLabel: event.dateLabel ?? "",
    locationLabel: event.locationLabel ?? "",
  };
}

function readFields(raw: unknown): EventFields | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const type = typeof data.type === "string" ? data.type.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : "";
  const status = asStatus(data.status);
  if (!title || !type || !description || !status) return null;
  return {
    title,
    type,
    description,
    status,
    dateLabel: typeof data.dateLabel === "string" ? data.dateLabel.trim() : "",
    locationLabel: typeof data.locationLabel === "string" ? data.locationLabel.trim() : "",
  };
}

function toEvent(fields: EventFields): CtrlEvent {
  return {
    ...FALLBACK,
    ...fields,
    dateLabel: fields.dateLabel || undefined,
    locationLabel: fields.locationLabel || undefined,
  };
}

export async function getEventFields(): Promise<EventFields> {
  await connection();

  // Try Firestore first
  try {
    const doc = await db().collection("config").doc("featured-event").get();
    if (doc.exists) {
      const parsed = readFields(doc.data());
      if (parsed) return parsed;
    }
  } catch (error) {
    console.warn("[site-event] Firestore get warning, falling back to disk:", error);
  }

  // Fallback to local file
  try {
    return readFields(JSON.parse(await readFile(FILE, "utf8"))) ?? fieldsFrom(FALLBACK);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fieldsFrom(FALLBACK);
    throw error;
  }
}

export async function getFeaturedEvent(): Promise<CtrlEvent> {
  return toEvent(await getEventFields());
}

export async function saveEventFields(fields: EventFields) {
  // Save to Firestore
  try {
    await db().collection("config").doc("featured-event").set(fields);
  } catch (error) {
    console.error("[site-event] Firestore save error:", error);
  }

  // Backup to local file
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(fields, null, 2), "utf8");
    await rename(tmp, FILE);
  } catch (err) {
    console.warn("[site-event] Local file save warning:", err);
  }
}
