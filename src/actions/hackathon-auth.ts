"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endParticipantSession, startParticipantSession } from "@/lib/participant-session";
import { lockSubmission } from "@/lib/submit-unlock";
import { upsertParticipant } from "@/lib/participants";
import { adminAuth } from "@/lib/firebase";

export type SessionError = { error: string };

/**
 * Called by the client right after Firebase sign-up / sign-in succeeds.
 * Receives the short-lived ID token, verifies it server-side, upserts the
 * Firestore profile, and issues a long-lived Firebase session cookie.
 *
 * @param idToken  - result of `user.getIdToken()` on the client
 * @param name     - display name
 */
export async function createSession(
  idToken: string,
  name?: string
): Promise<SessionError | null> {
  try {
    const decoded = await adminAuth().verifyIdToken(idToken);
    const email = decoded.email || "";
    const participantName = name?.trim() || decoded.name || (email ? email.split("@")[0] : "Participant");

    await upsertParticipant(decoded.uid, {
      name: participantName,
      email,
    });

    await startParticipantSession(idToken);
    revalidatePath("/admin", "layout");
    revalidatePath("/hackathon");
    revalidatePath("/hackathon/submit");
    return null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[createSession] failed:", message);
    return { error: message.includes("session cookie") ? "Authentication service configuration error." : "Something went wrong. Please try again." };
  }
}

export async function signOut() {
  await endParticipantSession();
  await lockSubmission();
  revalidatePath("/hackathon");
  revalidatePath("/hackathon/submit");
  redirect("/hackathon");
}
