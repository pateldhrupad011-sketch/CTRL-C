"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/admin-auth";
import { LIMITS, SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/interest";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { adminCredentials, safeEqual } from "@/lib/session-token";
import { deleteSubmission, updateSubmission } from "@/lib/submissions";

export type LoginState = { error?: string; username?: string };

const loginLimiter = createLimiter(5, 15 * 60 * 1000);

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const creds = adminCredentials();
  if (!creds) return { error: "Admin login isn’t set up on this server yet.", username };

  const ip = await clientIp();
  if (loginLimiter.isBlocked(ip)) {
    return { error: "Too many attempts. Wait 15 minutes and try again.", username };
  }

  const validLogin = creds.some((credential) => safeEqual(username, credential.username) && safeEqual(password, credential.password));
  if (!validLogin) {
    loginLimiter.hit(ip);
    return { error: "Wrong username or password.", username };
  }

  loginLimiter.reset(ip);
  await startSession(username);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

function readId(formData: FormData) {
  const id = formData.get("id");
  return typeof id === "string" ? id : "";
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const id = readId(formData);
  const status = formData.get("status");
  if (!SUBMISSION_STATUSES.includes(status as SubmissionStatus)) return;
  await updateSubmission(id, { status: status as SubmissionStatus });
  revalidatePath("/admin", "layout");
}

export async function saveNote(formData: FormData) {
  await requireAdmin();
  const id = readId(formData);
  const note = String(formData.get("note") ?? "").slice(0, LIMITS.note);
  await updateSubmission(id, { note });
  revalidatePath("/admin", "layout");
}

export async function removeSubmission(formData: FormData) {
  await requireAdmin();
  await deleteSubmission(readId(formData));
  revalidatePath("/admin", "layout");
  redirect("/admin");
}
