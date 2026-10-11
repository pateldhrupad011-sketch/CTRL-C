import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { getParticipant } from "./participants";
import { safeEqual } from "./session-token";

const COOKIE = "ctrlc_hacker";
const TTL_SECONDS = 60 * 60 * 24 * 30;

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const KEY_FILE = path.join(DATA_DIR, ".hackathon-session-key");

/** HACKATHON_SESSION_SECRET if set, otherwise a random key generated once and kept on disk. */
const secret = cache(async () => {
  if (process.env.HACKATHON_SESSION_SECRET) return process.env.HACKATHON_SESSION_SECRET;
  try {
    return (await readFile(KEY_FILE, "utf8")).trim();
  } catch {
    const key = randomBytes(32).toString("hex");
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(KEY_FILE, key, { encoding: "utf8", flag: "wx" }).catch(() => {});
    return (await readFile(KEY_FILE, "utf8")).trim();
  }
});

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(`hacker:${payload}`).digest("base64url");
}

export const getCurrentParticipant = cache(async () => {
  await connection();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, await secret()))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { id?: unknown; exp?: unknown };
    if (typeof data.id !== "string" || typeof data.exp !== "number" || data.exp * 1000 < Date.now()) return null;
    return (await getParticipant(data.id)) ?? null;
  } catch {
    return null;
  }
});

export async function startParticipantSession(id: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ id, exp })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload, await secret())}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function endParticipantSession() {
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}
