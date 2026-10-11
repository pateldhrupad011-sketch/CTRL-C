import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InterestInput, ResumeExt, SubmissionStatus } from "./interest";

export type Submission = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  resume: string;
  interests: string[];
  message: string;
  status: SubmissionStatus;
  note: string;
};

/**
 * Submissions are kept in a single JSON file on the server's disk.
 * Set DATA_DIR to move it; the default is `<project>/data`.
 * This needs a persistent filesystem (a VPS, Render disk, Railway volume…);
 * serverless hosts like Vercel wipe local files between requests.
 */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "submissions.json");
export const RESUME_DIR = path.join(DATA_DIR, "resumes");
export const RESUME_NAME = /^[0-9a-f-]{36}\.(pdf|docx|doc)$/;

async function load(): Promise<Submission[]> {
  try {
    const list = JSON.parse(await readFile(FILE, "utf8")) as Submission[];
    return list.map((s) => ({
      ...s,
      phone: s.phone ?? "",
      linkedin: s.linkedin ?? "",
      website: s.website ?? "",
      resume: s.resume ?? "",
      interests: s.interests ?? [],
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function save(list: Submission[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await rename(tmp, FILE);
}

let queue: Promise<unknown> = Promise.resolve();

/** Serializes read-modify-write cycles so concurrent requests can't overwrite each other. */
function mutate<T>(fn: (list: Submission[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await load();
    const result = await fn(list);
    await save(list);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export async function listSubmissions(): Promise<Submission[]> {
  await queue;
  const list = await load();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  await queue;
  return (await load()).find((s) => s.id === id);
}

export async function createSubmission(
  input: InterestInput,
  resume?: { bytes: Uint8Array; ext: ResumeExt },
): Promise<Submission> {
  const id = randomUUID();
  const resumeName = resume ? `${id}.${resume.ext}` : "";
  if (resume) {
    await mkdir(RESUME_DIR, { recursive: true });
    await writeFile(path.join(RESUME_DIR, resumeName), resume.bytes);
  }

  try {
    return await mutate((list) => {
      const now = new Date().toISOString();
      const submission: Submission = {
        id,
        createdAt: now,
        updatedAt: now,
        ...input,
        resume: resumeName,
        status: "new",
        note: "",
      };
      list.push(submission);
      return submission;
    });
  } catch (error) {
    if (resumeName) await unlink(path.join(RESUME_DIR, resumeName)).catch(() => {});
    throw error;
  }
}

export function updateSubmission(id: string, patch: Partial<Pick<Submission, "status" | "note">>) {
  return mutate((list) => {
    const item = list.find((s) => s.id === id);
    if (!item) return false;
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    return true;
  });
}

export function deleteSubmission(id: string) {
  return mutate(async (list) => {
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return false;
    const [removed] = list.splice(index, 1);
    if (removed?.resume) await unlink(path.join(RESUME_DIR, removed.resume)).catch(() => {});
    return true;
  });
}
