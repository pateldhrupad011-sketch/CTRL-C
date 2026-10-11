"use server";

import { revalidatePath } from "next/cache";
import { endParticipantSession, startParticipantSession } from "@/lib/participant-session";
import { lockSubmission } from "@/lib/submit-unlock";
import { sendMail } from "@/lib/mailer";
import { createParticipant, createResetCode, resetPasswordWithCode, verifyParticipant } from "@/lib/participants";
import { clientIp, createLimiter } from "@/lib/rate-limit";

export type AuthField = "name" | "email" | "password";
export type AuthState = { error?: string; errors?: Partial<Record<AuthField, string>>; name?: string; email?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const signupLimiter = createLimiter(5, 10 * 60 * 1000);
const signinLimiter = createLimiter(8, 15 * 60 * 1000);

function read(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim().replace(/\s+/g, " "),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { name, email, password } = read(formData);
  const errors: AuthState["errors"] = {};
  if (!name) errors.name = "Tell us your name.";
  else if (name.length > 100) errors.name = "Keep it under 100 characters.";
  if (!email) errors.email = "We need your email.";
  else if (email.length > 200 || !EMAIL.test(email)) errors.email = "That email doesn’t look right.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  else if (password.length > 200) errors.password = "That password is too long.";
  if (Object.keys(errors).length > 0) return { errors, name, email };

  const ip = await clientIp();
  if (signupLimiter.isBlocked(ip)) return { error: "Too many sign-ups from here. Try again in a few minutes.", name, email };

  const participant = await createParticipant({ name, email, password });
  if (!participant) return { errors: { email: "That email already has an account. Sign in instead." }, name, email };

  signupLimiter.hit(ip);
  await startParticipantSession(participant.id);
  revalidatePath("/admin", "layout");
  revalidatePath("/hackathon");
  return {};
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = read(formData);
  if (!email || !password) return { error: "Enter your email and password.", email };

  const ip = await clientIp();
  if (signinLimiter.isBlocked(ip)) return { error: "Too many attempts. Wait 15 minutes and try again.", email };

  const participant = await verifyParticipant(email, password);
  if (!participant) {
    signinLimiter.hit(ip);
    return { error: "Wrong email or password.", email };
  }

  signinLimiter.reset(ip);
  await startParticipantSession(participant.id);
  revalidatePath("/hackathon");
  return {};
}

export type ResetState = { step: "email" | "code" | "done"; email?: string; error?: string };

const resetRequestLimiter = createLimiter(5, 15 * 60 * 1000);
const resetConfirmLimiter = createLimiter(10, 15 * 60 * 1000);

export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return { step: "email", email, error: "Enter the email you signed up with." };

  const ip = await clientIp();
  if (resetRequestLimiter.isBlocked(ip)) return { step: "email", email, error: "Too many requests. Try again in 15 minutes." };
  resetRequestLimiter.hit(ip);

  const result = await createResetCode(email);
  if (result) {
    try {
      await sendMail({
        to: email,
        subject: "Your Ctrl C hackathon reset code",
        text: `Hi ${result.name},\n\nYour code to reset your Ctrl C hackathon password is: ${result.code}\n\nIt expires in 15 minutes. If you didn’t ask for this, you can ignore this email.`,
      });
    } catch (error) {
      console.error("Failed to send reset email", error);
      return { step: "email", email, error: "We couldn’t send the email right now. Please try again later." };
    }
  }
  // Same response either way, so the form can't be used to check who has an account.
  return { step: "code", email };
}

export async function confirmPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").replace(/\s+/g, "");
  const password = String(formData.get("password") ?? "");

  if (!/^\d{6}$/.test(code)) return { step: "code", email, error: "Enter the 6-digit code from the email." };
  if (password.length < 8 || password.length > 200) return { step: "code", email, error: "Use a new password of at least 8 characters." };

  const ip = await clientIp();
  if (resetConfirmLimiter.isBlocked(ip)) return { step: "code", email, error: "Too many attempts. Try again in 15 minutes." };

  if (!(await resetPasswordWithCode(email, code, password))) {
    resetConfirmLimiter.hit(ip);
    return { step: "code", email, error: "That code is wrong or has expired. Check it, or request a new one." };
  }
  return { step: "done", email };
}

export async function signOut() {
  await endParticipantSession();
  await lockSubmission();
  revalidatePath("/hackathon");
  revalidatePath("/hackathon/submit");
}
