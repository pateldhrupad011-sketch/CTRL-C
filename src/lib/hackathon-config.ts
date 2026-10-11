import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";

export const CODE_LIMITS = { min: 4, max: 40 };

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "hackathon-config.json");

export type HackathonConfig = { submissionCode: string };

export function hashSubmissionCode(code: string) {
  return createHash("sha256").update(`ctrlc-submit:${code}`).digest("hex");
}

export async function getHackathonConfig(): Promise<HackathonConfig> {
  await connection();
  try {
    const raw = JSON.parse(await readFile(FILE, "utf8")) as { submissionCode?: unknown };
    const submissionCode = typeof raw.submissionCode === "string" ? raw.submissionCode : "";
    return { submissionCode };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { submissionCode: "" };
    throw error;
  }
}

export async function saveHackathonConfig(config: HackathonConfig) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(config, null, 2), "utf8");
  await rename(tmp, FILE);
}
