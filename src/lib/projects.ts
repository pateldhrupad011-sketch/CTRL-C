import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./firebase";
import type { ImageExt, ProjectInput } from "./hackathon";

export type Submitter = { id: string; name: string; email: string };

export type Project = ProjectInput & {
  id: string;
  createdAt: string;
  image: string;
  submittedBy?: Submitter;
  imageData?: string; // base64 string for zero-disk serverless persistence
};

const COLLECTION = "projects";
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "projects.json");
export const IMAGE_DIR = path.join(DATA_DIR, "project-images");
export const IMAGE_NAME = /^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

async function loadFile(): Promise<Project[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Project[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveFile(list: Project[]) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
    await rename(tmp, FILE);
  } catch (err) {
    console.warn("[projects] Failed to save local file:", err);
  }
}

let queue: Promise<unknown> = Promise.resolve();

function mutateFile<T>(fn: (list: Project[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await loadFile();
    const result = await fn(list);
    await saveFile(list);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export async function listProjects(): Promise<Project[]> {
  try {
    const snap = await db().collection(COLLECTION).get();
    if (!snap.empty) {
      const items = snap.docs.map((d) => {
        const data = d.data();
        const { imageData, ...rest } = data;
        return rest as Project;
      });
      return items.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }
  } catch (error) {
    console.warn("[projects] Firestore list error, falling back to disk:", error);
  }

  await queue;
  const list = await loadFile();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProjectBySubmitter(submitterId: string): Promise<Project | undefined> {
  try {
    const snap = await db().collection(COLLECTION).where("submittedBy.id", "==", submitterId).limit(1).get();
    if (!snap.empty) {
      const data = snap.docs[0].data();
      const { imageData, ...project } = data;
      return project as Project;
    }
  } catch (error) {
    console.warn("[projects] Firestore submitter lookup error, falling back to disk:", error);
  }

  await queue;
  return (await loadFile()).find((project) => project.submittedBy?.id === submitterId);
}

export async function getProjectImage(id: string): Promise<Buffer | null> {
  try {
    const doc = await db().collection(COLLECTION).doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      if (data?.imageData) {
        return Buffer.from(data.imageData, "base64");
      }
    }
  } catch (error) {
    console.warn("[projects] Firestore image fetch error:", error);
  }
  return null;
}

export async function createProject(
  input: ProjectInput,
  image: { bytes: Uint8Array; ext: ImageExt },
  submittedBy: Submitter,
) {
  const id = randomUUID();
  const imageName = `${id}.${image.ext}`;
  const base64Data = Buffer.from(image.bytes).toString("base64");

  // Save to local disk
  try {
    await mkdir(IMAGE_DIR, { recursive: true });
    await writeFile(path.join(IMAGE_DIR, imageName), image.bytes);
  } catch (err) {
    console.warn("[projects] Failed to save image to disk:", err);
  }

  const now = new Date().toISOString();
  const project: Project = {
    id,
    createdAt: now,
    ...input,
    image: imageName,
    submittedBy,
  };

  // Save to Firestore for permanent persistence
  try {
    await db().collection(COLLECTION).doc(id).set({
      ...project,
      imageData: base64Data,
    });
  } catch (error) {
    console.error("[projects] Firestore createProject error:", error);
  }

  // Backup to file
  await mutateFile((list) => {
    list.push(project);
    return project;
  });

  return project;
}

export async function deleteProject(id: string) {
  // Delete from Firestore
  try {
    await db().collection(COLLECTION).doc(id).delete();
  } catch (error) {
    console.warn("[projects] Firestore delete error:", error);
  }

  const removed = await mutateFile((list) => {
    const index = list.findIndex((p) => p.id === id);
    return index === -1 ? undefined : list.splice(index, 1)[0];
  });

  const imageName = removed?.image || `${id}.png`;
  try {
    await unlink(path.join(IMAGE_DIR, imageName)).catch(() => {});
  } catch {
    // Ignore unlink error
  }

  return true;
}
