import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createToken, readToken } from "./session-token";

export const getAdminSession = cache(async () => {
  await connection();
  const store = await cookies();
  return readToken(store.get(SESSION_COOKIE)?.value);
});

/** Call at the top of every admin page, action and route handler. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function startSession(username: string) {
  const token = createToken(username);
  if (!token) throw new Error("Admin credentials are not configured.");
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/admin", maxAge: 0 });
}
