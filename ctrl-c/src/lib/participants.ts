import "server-only";

import { createHash, randomBytes, randomInt, randomUUID, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export type Participant = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  passwordHash: string;
  reset?: { codeHash: string; expiresAt: number; attempts: number };
};

export type PublicParticipant = Omit<Participant, "passwordHash">;

const COLLECTION = "participants";
const col = () => db().collection(COLLECTION);

function strip(p: Participant): PublicParticipant {
  return { id: p.id, createdAt: p.createdAt, name: p.name, email: p.email };
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

async function checkPassword(password: string, stored: string) {
  const [, salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scrypt(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

// Used when no account matches, so a wrong email takes as long as a wrong password.
const DUMMY_HASH = hashPassword(randomUUID());

async function findByEmail(email: string) {
  const snap = await col().where("email", "==", email).limit(1).get();
  return snap.empty ? undefined : (snap.docs[0].data() as Participant);
}

export async function listParticipants(): Promise<PublicParticipant[]> {
  const snap = await col().get();
  return snap.docs
    .map((d) => strip(d.data() as Participant))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getParticipant(id: string): Promise<PublicParticipant | undefined> {
  const doc = await col().doc(id).get();
  return doc.exists ? strip(doc.data() as Participant) : undefined;
}

/** Returns null when the email is already registered. */
export async function createParticipant(input: { name: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password);
  const participant: Participant = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    passwordHash,
  };

  return db().runTransaction(async (tx) => {
    const existing = await tx.get(col().where("email", "==", input.email).limit(1));
    if (!existing.empty) return null;
    tx.set(col().doc(participant.id), participant);
    return strip(participant);
  });
}

export async function verifyParticipant(email: string, password: string) {
  const found = await findByEmail(email);
  const ok = await checkPassword(password, found?.passwordHash ?? (await DUMMY_HASH));
  return found && ok ? strip(found) : null;
}

const RESET_TTL_MS = 15 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;

function hashCode(code: string) {
  return createHash("sha256").update(`reset:${code}`).digest("hex");
}

/** Returns a fresh 6-digit code, or null when no account uses this email. */
export async function createResetCode(email: string) {
  const found = await findByEmail(email);
  if (!found) return null;
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await col().doc(found.id).update({
    reset: { codeHash: hashCode(code), expiresAt: Date.now() + RESET_TTL_MS, attempts: 0 },
  });
  return { code, name: found.name };
}

export async function resetPasswordWithCode(email: string, code: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  const found = await findByEmail(email);
  const reset = found?.reset;
  if (!found || !reset || reset.expiresAt < Date.now() || reset.attempts >= RESET_MAX_ATTEMPTS) return false;

  const ref = col().doc(found.id);
  if (hashCode(code) !== reset.codeHash) {
    await ref.update({ "reset.attempts": FieldValue.increment(1) });
    return false;
  }
  await ref.update({ passwordHash, reset: FieldValue.delete() });
  return true;
}