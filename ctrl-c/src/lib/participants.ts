import "server-only";

import { createHash, randomBytes, randomInt, randomUUID, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

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

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "hackathon-signups.json");

async function load(): Promise<Participant[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Participant[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function save(list: Participant[]) {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
  await rename(tmp, FILE);
}

let queue: Promise<unknown> = Promise.resolve();

function mutate<T>(fn: (list: Participant[]) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const list = await load();
    const result = await fn(list);
    await save(list);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

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

export async function listParticipants(): Promise<PublicParticipant[]> {
  await queue;
  return (await load()).map(strip).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getParticipant(id: string): Promise<PublicParticipant | undefined> {
  await queue;
  const found = (await load()).find((p) => p.id === id);
  return found && strip(found);
}

/** Returns null when the email is already registered. */
export async function createParticipant(input: { name: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password);
  return mutate((list) => {
    if (list.some((p) => p.email === input.email)) return null;
    const participant: Participant = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name: input.name,
      email: input.email,
      passwordHash,
    };
    list.push(participant);
    return strip(participant);
  });
}

export async function verifyParticipant(email: string, password: string) {
  await queue;
  const found = (await load()).find((p) => p.email === email);
  const ok = await checkPassword(password, found?.passwordHash ?? (await DUMMY_HASH));
  return found && ok ? strip(found) : null;
}

const RESET_TTL_MS = 15 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;

function hashCode(code: string) {
  return createHash("sha256").update(`reset:${code}`).digest("hex");
}

/** Returns a fresh 6-digit code, or null when no account uses this email. */
export function createResetCode(email: string) {
  return mutate((list) => {
    const found = list.find((p) => p.email === email);
    if (!found) return null;
    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    found.reset = { codeHash: hashCode(code), expiresAt: Date.now() + RESET_TTL_MS, attempts: 0 };
    return { code, name: found.name };
  });
}

export function resetPasswordWithCode(email: string, code: string, newPassword: string) {
  return hashPassword(newPassword).then((passwordHash) =>
    mutate((list) => {
      const found = list.find((p) => p.email === email);
      const reset = found?.reset;
      if (!found || !reset || reset.expiresAt < Date.now() || reset.attempts >= RESET_MAX_ATTEMPTS) return false;
      if (hashCode(code) !== reset.codeHash) {
        reset.attempts += 1;
        return false;
      }
      found.passwordHash = passwordHash;
      delete found.reset;
      return true;
    }),
  );
}
