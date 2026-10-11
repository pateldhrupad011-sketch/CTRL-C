import "server-only";

import { db } from "@/lib/firebase";

export type Participant = {
  id: string;       // Firebase Auth UID
  createdAt: string;
  name: string;
  email: string;
};

export type PublicParticipant = Participant;

const COLLECTION = "participants";
const col = () => db().collection(COLLECTION);

/**
 * Creates a Firestore profile the first time a user signs up via Firebase Auth.
 * Subsequent sign-ins are a no-op (returns the existing record).
 */
export async function upsertParticipant(
  uid: string,
  data: { name: string; email: string }
): Promise<PublicParticipant> {
  const ref = col().doc(uid);
  const snap = await ref.get();
  if (snap.exists) {
    const existing = snap.data() as Participant;
    const shouldUpdateName = data.name && (existing.name === "Participant" || !existing.name || existing.name !== data.name);
    const shouldUpdateEmail = data.email && existing.email !== data.email;
    if (shouldUpdateName || shouldUpdateEmail) {
      const updated: Participant = {
        ...existing,
        name: shouldUpdateName ? data.name : existing.name,
        email: data.email || existing.email,
      };
      await ref.set(updated, { merge: true });
      return updated;
    }
    return existing;
  }

  const participant: Participant = {
    id: uid,
    createdAt: new Date().toISOString(),
    name: data.name || data.email?.split("@")[0] || "Participant",
    email: data.email,
  };
  await ref.set(participant);
  return participant;
}

export async function getParticipant(id: string): Promise<PublicParticipant | undefined> {
  try {
    const doc = await col().doc(id).get();
    return doc.exists ? (doc.data() as Participant) : undefined;
  } catch (error) {
    console.error("[getParticipant] failed:", error);
    return undefined;
  }
}

export async function listParticipants(): Promise<PublicParticipant[]> {
  try {
    const snap = await col().get();
    return snap.docs
      .map((d) => d.data() as Participant)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch (error) {
    console.error("[listParticipants] failed:", error);
    return [];
  }
}