import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { whatWeDo } from "@/content/copy";

export const ACTIVITY_STATUSES = [
  "Planned",
  "In the works",
  "Coming soon",
  "Registration open",
  "Happening now",
  "On hold",
  "Finished",
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export type Activity = { part: string; title: string; body: string; status: ActivityStatus };

export const ACTIVITY_LIMITS = { title: 60, body: 300, max: 20 };

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "activities.json");

const DEFAULTS: Activity[] = [
  { part: whatWeDo.featured.part, title: whatWeDo.featured.title, body: whatWeDo.featured.body, status: "Planned" },
  ...whatWeDo.parts.map((p) => ({ part: p.part, title: p.title, body: p.body, status: p.status as ActivityStatus })),
];

function nextPart(existing: Activity[]) {
  const used = new Set(existing.map((a) => a.part));
  for (let i = 1; i <= ACTIVITY_LIMITS.max + 1; i++) {
    const part = `A${i}`;
    if (!used.has(part)) return part;
  }
  return `A${existing.length + 1}`;
}

function readList(raw: unknown): Activity[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const list: Activity[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const data = item as Record<string, unknown>;
    const part = typeof data.part === "string" ? data.part.trim() : "";
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const body = typeof data.body === "string" ? data.body.trim() : "";
    const status = data.status;
    if (!part || !title || !body) continue;
    if (!ACTIVITY_STATUSES.includes(status as ActivityStatus)) continue;
    list.push({ part, title, body, status: status as ActivityStatus });
  }
  return list.length ? list : null;
}

export function blankActivity(existing: Activity[]): Activity {
  return { part: nextPart(existing), title: "", body: "", status: "Planned" };
}

export async function getActivities(): Promise<Activity[]> {
  await connection();
  try {
    return readList(JSON.parse(await readFile(FILE, "utf8"))) ?? DEFAULTS;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return DEFAULTS;
    throw error;
  }
}

export async function saveActivities(list: Activity[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await rename(tmp, FILE);
}
