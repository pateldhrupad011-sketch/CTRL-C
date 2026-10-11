"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { PROJECT_LIMITS, type ProjectErrors, type ProjectInput, sniffImage, validateProject } from "@/lib/hackathon";
import { deleteProject, createProject, getProjectBySubmitter } from "@/lib/projects";
import { getCurrentParticipant } from "@/lib/participant-session";
import { isSubmissionUnlocked } from "@/lib/submit-unlock";
import { clientIp, createLimiter } from "@/lib/rate-limit";

export type ProjectState =
  | { status: "idle" }
  | { status: "success"; teamName: string }
  | { status: "error"; message?: string; errors?: ProjectErrors; values: ProjectInput };

const limiter = createLimiter(5, 10 * 60 * 1000);

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitProject(_prev: ProjectState, formData: FormData): Promise<ProjectState> {
  const participant = await getCurrentParticipant();
  const values: ProjectInput = {
    teamName: text(formData, "teamName").replace(/\s+/g, " "),
    teammates: formData
      .getAll("teammates")
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim().replace(/\s+/g, " "))
      .filter(Boolean),
    description: text(formData, "description").replace(/\r\n?/g, "\n"),
    githubUrl: text(formData, "githubUrl"),
    demoUrl: text(formData, "demoUrl"),
    aiDeclaration: text(formData, "aiDeclaration").replace(/\r\n?/g, "\n"),
  };

  if (!participant) {
    return { status: "error", message: "Your session ended. Sign in again to submit your project.", values };
  }

  if (!(await isSubmissionUnlocked())) {
    return { status: "error", message: "Enter the submission code first.", values };
  }

  if (text(formData, "website")) return { status: "success", teamName: values.teamName };

  if (await getProjectBySubmitter(participant.id)) {
    return {
      status: "error",
      message: "You already have a project submission. Ask an organizer to delete it before submitting again.",
      values,
    };
  }

  const errors = validateProject(values);

  const file = formData.get("image");
  let image: { bytes: Uint8Array; ext: NonNullable<ReturnType<typeof sniffImage>> } | undefined;
  if (!(file instanceof File) || file.size === 0) errors.image = "Add an image for the top of your project.";
  else if (file.size > PROJECT_LIMITS.imageBytes) errors.image = "Keep the image under 5 MB.";
  else {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffImage(bytes);
    if (!ext) errors.image = "Use a PNG, JPG, WebP or GIF image.";
    else image = { bytes, ext };
  }

  if (Object.keys(errors).length > 0 || !image) return { status: "error", errors, values };

  const ip = await clientIp();
  if (limiter.isBlocked(ip)) {
    return { status: "error", message: "Too many submissions from here. Try again in a few minutes.", values };
  }

  try {
    await createProject(values, image, { id: participant.id, name: participant.name, email: participant.email });
  } catch (error) {
    console.error("Failed to save project", error);
    return { status: "error", message: "Something went wrong saving that. Please try again.", values };
  }

  limiter.hit(ip);
  revalidatePath("/admin", "layout");
  return { status: "success", teamName: values.teamName };
}

export async function removeProject(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id === "string") await deleteProject(id);
  revalidatePath("/admin", "layout");
}
