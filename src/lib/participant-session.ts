import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";
import { cache } from "react";
import { adminAuth } from "./firebase";
import { getParticipant, upsertParticipant } from "./participants";

const COOKIE = "ctrlc_hacker";
/** Firebase Admin allows session cookies between 5 minutes and 14 days (1209600000 ms). We use 13 days to avoid any boundary issues. */
const TTL_SECONDS = 60 * 60 * 24 * 13;

/**
 * Creates a Firebase session cookie from a freshly-minted ID token and stores
 * it as an httpOnly cookie. Call this right after Firebase client-side sign-in.
 */
export async function startParticipantSession(idToken: string) {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: TTL_SECONDS * 1000, // Admin SDK expects milliseconds
  });
  (await cookies()).set(COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

/**
 * Returns the currently signed-in participant, or null.
 * Verifies the session cookie against Firebase each request (checks revocation).
 */
export const getCurrentParticipant = cache(async () => {
  await connection();
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(token, true /* checkRevoked */);
    let participant = await getParticipant(decoded.uid);
    if (!participant && decoded.email) {
      participant = await upsertParticipant(decoded.uid, {
        name: decoded.name || decoded.email.split("@")[0] || "Participant",
        email: decoded.email,
      });
    }
    return participant ?? null;
  } catch {
    // Cookie expired, revoked, or tampered — treat as signed-out.
    return null;
  }
});

export async function endParticipantSession() {
  // Revoke all refresh tokens for the user so the cookie is immediately invalid.
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (token) {
      const decoded = await adminAuth().verifySessionCookie(token).catch(() => null);
      if (decoded) await adminAuth().revokeRefreshTokens(decoded.uid);
    }
  } catch {
    // Best-effort revocation — always clear the cookie.
  }
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}
