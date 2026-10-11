"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { CODE_LIMITS, getHackathonConfig, saveHackathonConfig } from "@/lib/hackathon-config";
import { getCurrentParticipant } from "@/lib/participant-session";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { lockSubmission, unlockSubmission } from "@/lib/submit-unlock";
import { safeEqual } from "@/lib/session-token";

export type CodeState = { ok?: boolean; error?: string; at?: number };
export type UnlockState = { error?: string };

const unlockLimiter = createLimiter(8, 15 * 60 * 1000);

export async function saveSubmissionCode(_prev: CodeState, formData: FormData): Promise<CodeState> {
  await requireAdmin();
  const submissionCode = String(formData.get("submissionCode") ?? "").trim();
  if (submissionCode.length < CODE_LIMITS.min) {
    return { error: `Use at least ${CODE_LIMITS.min} characters.` };
  }
  if (submissionCode.length > CODE_LIMITS.max) {
    return { error: `Keep it under ${CODE_LIMITS.max} characters.` };
  }
  await saveHackathonConfig({ submissionCode });
  revalidatePath("/hackathon");
  revalidatePath("/admin/hackathon");
  revalidatePath("/", "layout");
  return { ok: true, at: Date.now() };
}

export async function unlockWithCode(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const participant = await getCurrentParticipant();
  if (!participant) return { error: "Sign in first." };

  const ip = await clientIp();
  if (unlockLimiter.isBlocked(ip)) return { error: "Too many tries. Wait a few minutes." };

  const entered = String(formData.get("code") ?? "").trim();
  const { submissionCode } = await getHackathonConfig();
  if (!submissionCode) return { error: "Submissions are not open yet." };

  unlockLimiter.hit(ip);
  if (!entered || !safeEqual(entered, submissionCode)) return { error: "That code is not right." };

  await unlockSubmission(submissionCode);
  revalidatePath("/hackathon");
  revalidatePath("/hackathon/submit");
  redirect("/hackathon/submit");
}

export async function lockSubmitAccess() {
  await getCurrentParticipant();
  await lockSubmission();
  revalidatePath("/hackathon");
}
