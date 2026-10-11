import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./firebase";
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
  resumeData?: string; // base64 for serverless resilience
};

const COLLECTION = "submissions";
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "submissions.json");
export const RESUME_DIR = path.join(DATA_DIR, "resumes");
export const RESUME_NAME = /^[0-9a-f-]{36}\.(pdf|docx|doc)$/;

function normalize(s: Partial<Submission> & { id: string; name: string; email: string }): Submission {
  return {
    id: s.id,
    createdAt: s.createdAt || new Date().toISOString(),
    updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
    name: s.name,
    email: s.email,
    phone: s.phone ?? "",
    linkedin: s.linkedin ?? "",
    website: s.website ?? "",
    resume: s.resume ?? "",
    interests: s.interests ?? [],
    message: s.message ?? "",
    status: (s.status as SubmissionStatus) || "new",
    note: s.note ?? "",
  };
}

async function loadFile(): Promise<Submission[]> {
  try {
    const list = JSON.parse(await readFile(FILE, "utf8")) as Submission[];
    return list.map(normalize);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveFile(list: Submission[]) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
    await rename(tmp, FILE);
  } catch (err) {
    console.warn("[submissions] Local file save warning:", err);
  }
}

let queue: Promise<unknown> = Promise.resolve();

function mutateFile<T>(fn: (list: Submission[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await loadFile();
    const result = await fn(list);
    await saveFile(list);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export async function listSubmissions(): Promise<Submission[]> {
  try {
    const snap = await db().collection(COLLECTION).get();
    if (!snap.empty) {
      const items = snap.docs.map((d) => normalize(d.data() as Submission));
      return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  } catch (error) {
    console.warn("[submissions] Firestore list error, falling back to disk:", error);
  }

  await queue;
  const list = await loadFile();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  try {
    const doc = await db().collection(COLLECTION).doc(id).get();
    if (doc.exists) {
      return normalize(doc.data() as Submission);
    }
  } catch (error) {
    console.warn("[submissions] Firestore get error, falling back to disk:", error);
  }

  await queue;
  return (await loadFile()).find((s) => s.id === id);
}

export async function getResumeData(id: string): Promise<Buffer | null> {
  try {
    const doc = await db().collection(COLLECTION).doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.resumeData) {
        return Buffer.from(data.resumeData, "base64");
      }
    }
  } catch (error) {
    console.warn("[submissions] Firestore getResumeData error:", error);
  }
  return null;
}

export async function createSubmission(
  input: InterestInput,
  resume?: { bytes: Uint8Array; ext: ResumeExt },
): Promise<Submission> {
  const id = randomUUID();
  const resumeName = resume ? `${id}.${resume.ext}` : "";
  const resumeBase64 = resume ? Buffer.from(resume.bytes).toString("base64") : undefined;

  if (resume) {
    try {
      await mkdir(RESUME_DIR, { recursive: true });
      await writeFile(path.join(RESUME_DIR, resumeName), resume.bytes);
    } catch (err) {
      console.warn("[submissions] Local resume file write warning:", err);
    }
  }

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

  // Save to Firestore
  try {
    await db().collection(COLLECTION).doc(id).set({
      ...submission,
      resumeData: resumeBase64 || null,
    });
  } catch (error) {
    console.error("[submissions] Firestore createSubmission error:", error);
  }

  // Backup to file
  await mutateFile((list) => {
    list.push(submission);
    return submission;
  });

  return submission;
}

export async function updateSubmission(id: string, patch: Partial<Pick<Submission, "status" | "note">>) {
  const now = new Date().toISOString();

  // Update in Firestore
  try {
    await db().collection(COLLECTION).doc(id).set(
      {
        ...patch,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("[submissions] Firestore update warning:", error);
  }

  return mutateFile((list) => {
    const item = list.find((s) => s.id === id);
    if (!item) return false;
    Object.assign(item, patch, { updatedAt: now });
    return true;
  });
}

export async function deleteSubmission(id: string) {
  // Delete from Firestore
  try {
    await db().collection(COLLECTION).doc(id).delete();
  } catch (error) {
    console.warn("[submissions] Firestore delete warning:", error);
  }

  return mutateFile(async (list) => {
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return false;
    const [removed] = list.splice(index, 1);
    if (removed?.resume) await unlink(path.join(RESUME_DIR, removed.resume)).catch(() => {});
    return true;
  });
}
