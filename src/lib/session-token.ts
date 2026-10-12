import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "ctrlc_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminCredential = { username: string; password: string };

export function adminCredentials(): AdminCredential[] | null {
  const configured = process.env.ADMIN_USERS;
  if (configured) {
    try {
      const users = JSON.parse(configured) as unknown;
      if (Array.isArray(users)) {
        const valid = users.filter(
          (user): user is AdminCredential =>
            typeof user === "object" &&
            user !== null &&
            typeof (user as AdminCredential).username === "string" &&
            typeof (user as AdminCredential).password === "string" &&
            Boolean((user as AdminCredential).username) &&
            Boolean((user as AdminCredential).password),
        );
        if (valid.length > 0) return valid;
      }
    } catch {
      // Fall through to the original single-admin configuration.
    }
  }

  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return [{ username, password }];
}

function secret(): string | null {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  const creds = adminCredentials();
  // Falls back to a key derived from the credentials, so changing the password signs everyone out.
  return creds ? createHash("sha256").update(`ctrlc-session:${JSON.stringify(creds)}`).digest("hex") : null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Constant-time string comparison that also hides length differences. */
export function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function createToken(username: string): string | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ u: username, exp })).toString("base64url");
  return `${payload}.${sign(payload, key)}`;
}

export function readToken(token: string | undefined): { username: string } | null {
  const key = secret();
  if (!token || !key) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, key))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { u?: unknown; exp?: unknown };
    if (typeof data.u !== "string" || typeof data.exp !== "number") return null;
    if (data.exp * 1000 < Date.now()) return null;
    if (!adminCredentials()?.some((credential) => credential.username === data.u)) return null;
    return { username: data.u };
  } catch {
    return null;
  }
}
