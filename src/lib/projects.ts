import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ImageExt, ProjectInput } from "./hackathon";

export type Submitter = { id: string; name: string; email: string };

export type Project = ProjectInput & {
  id: string;
  createdAt: string;
  image: string;
  submittedBy?: Submitter;
};

/** Stored next to the interest submissions; see the note in submissions.ts about persistent disks. */
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "projects.json");
export const IMAGE_DIR = path.join(DATA_DIR, "project-images");
export const IMAGE_NAME = /^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

async function load(): Promise<Project[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Project[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function save(list: Project[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await rename(tmp, FILE);
}

let queue: Promise<unknown> = Promise.resolve();

function mutate<T>(fn: (list: Project[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await load();
    const result = await fn(list);
    await save(list);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export async function listProjects(): Promise<Project[]> {
  await queue;
  const list = await load();
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createProject(
  input: ProjectInput,
  image: { bytes: Uint8Array; ext: ImageExt },
  submittedBy: Submitter,
) {
  const id = randomUUID();
  const imageName = `${id}.${image.ext}`;
  await mkdir(IMAGE_DIR, { recursive: true });
  await writeFile(path.join(IMAGE_DIR, imageName), image.bytes);

  try {
    return await mutate((list) => {
      const project: Project = { id, createdAt: new Date().toISOString(), ...input, image: imageName, submittedBy };
      list.push(project);
      return project;
    });
  } catch (error) {
    await unlink(path.join(IMAGE_DIR, imageName)).catch(() => {});
    throw error;
  }
}

export async function deleteProject(id: string) {
  const removed = await mutate((list) => {
    const index = list.findIndex((p) => p.id === id);
    return index === -1 ? undefined : list.splice(index, 1)[0];
  });
  if (removed && IMAGE_NAME.test(removed.image)) {
    await unlink(path.join(IMAGE_DIR, removed.image)).catch(() => {});
  }
  return !!removed;
}
