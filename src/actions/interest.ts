"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LIMITS, type FieldErrors, type InterestInput, sniffResume, validateInterest } from "@/lib/interest";
import { clientIp, createLimiter } from "@/lib/rate-limit";
import { createSubmission } from "@/lib/submissions";

export type InterestState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message?: string; errors?: FieldErrors; values: InterestInput };

const limiter = createLimiter(5, 10 * 60 * 1000);

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitInterest(_prev: InterestState, formData: FormData): Promise<InterestState> {
  const values: InterestInput = {
    name: text(formData, "name").replace(/\s+/g, " "),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone").replace(/\s+/g, " "),
    linkedin: text(formData, "linkedin"),
    website: text(formData, "homepage"),
    interests: formData.getAll("interests").filter((v): v is string => typeof v === "string"),
    message: text(formData, "message").replace(/\r\n?/g, "\n"),
  };

  if (text(formData, "website")) redirect("/register/thanks");

  const errors = validateInterest(values);

  const file = formData.get("resume");
  let resume: { bytes: Uint8Array; ext: NonNullable<ReturnType<typeof sniffResume>> } | undefined;
  if (file instanceof File && file.size > 0) {
    if (file.size > LIMITS.resumeBytes) errors.resume = "Keep the resume under 5 MB.";
    else {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const ext = sniffResume(bytes);
      if (!ext) errors.resume = "Use a PDF, DOC or DOCX file.";
      else resume = { bytes, ext };
    }
  }

  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  const ip = await clientIp();
  if (limiter.isBlocked(ip)) {
    return { status: "error", message: "Too many submissions from here. Try again in a few minutes.", values };
  }

  try {
    await createSubmission(values, resume);
  } catch (error) {
    console.error("Failed to save submission", error);
    return { status: "error", message: "Something went wrong saving that. Please try again.", values };
  }

  limiter.hit(ip);
  revalidatePath("/admin", "layout");
  redirect("/register/thanks");
}
