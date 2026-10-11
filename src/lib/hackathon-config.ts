import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { db } from "./firebase";

export const CODE_LIMITS = { min: 4, max: 40 };

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "hackathon-config.json");

export type HackathonConfig = { submissionCode: string };

export function hashSubmissionCode(code: string) {
  return createHash("sha256").update(`ctrlc-submit:${code}`).digest("hex");
}

export async function getHackathonConfig(): Promise<HackathonConfig> {
  await connection();

  // Try Firestore first
  try {
    const doc = await db().collection("config").doc("hackathon").get();
    if (doc.exists) {
      const data = doc.data();
      const submissionCode = typeof data?.submissionCode === "string" ? data.submissionCode : "";
      return { submissionCode };
    }
  } catch (error) {
    console.warn("[hackathon-config] Firestore get warning, falling back to disk:", error);
  }

  // Fallback to local file
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
  // Save to Firestore
  try {
    await db().collection("config").doc("hackathon").set(config);
  } catch (error) {
    console.error("[hackathon-config] Firestore save error:", error);
  }

  // Backup to local file
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(config, null, 2), "utf8");
    await rename(tmp, FILE);
  } catch (err) {
    console.warn("[hackathon-config] Local file save warning:", err);
  }
}
