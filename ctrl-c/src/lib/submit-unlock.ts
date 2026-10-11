import "server-only";

import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { getHackathonConfig, hashSubmissionCode } from "./hackathon-config";
import { safeEqual } from "./session-token";

const COOKIE = "ctrlc_submit";
const TTL_SECONDS = 60 * 60 * 24 * 14;

function sign(payload: string) {
  const key = process.env.HACKATHON_SESSION_SECRET || "ctrlc-submit-unlock";
  return createHmac("sha256", key).update(`submit:${payload}`).digest("base64url");
}

export const isSubmissionUnlocked = cache(async () => {
  await connection();
  const { submissionCode } = await getHackathonConfig();
  if (!submissionCode) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      hash?: unknown;
      exp?: unknown;
    };
    if (typeof data.hash !== "string" || typeof data.exp !== "number") return false;
    if (data.exp * 1000 < Date.now()) return false;
    return safeEqual(data.hash, hashSubmissionCode(submissionCode));
  } catch {
    return false;
  }
});

export async function unlockSubmission(code: string) {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ hash: hashSubmissionCode(code), exp })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function lockSubmission() {
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}
