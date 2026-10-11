export const PROJECT_LIMITS = {
  teamName: 80,
  memberName: 80,
  maxMembers: 6,
  description: 2000,
  url: 300,
  aiDeclaration: 2000,
  imageBytes: 5 * 1024 * 1024,
} as const;

export const IMAGE_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type ImageExt = (typeof IMAGE_TYPES)[keyof typeof IMAGE_TYPES];

export type ProjectInput = {
  teamName: string;
  teammates: string[];
  description: string;
  githubUrl: string;
  demoUrl: string;
  aiDeclaration: string;
};

export type ProjectField = keyof ProjectInput | "image";
export type ProjectErrors = Partial<Record<ProjectField, string>>;

function httpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export function validateProject(input: ProjectInput): ProjectErrors {
  const L = PROJECT_LIMITS;
  const errors: ProjectErrors = {};

  if (!input.teamName) errors.teamName = "Give your team a name.";
  else if (input.teamName.length > L.teamName) errors.teamName = `Keep it under ${L.teamName} characters.`;

  if (input.teammates.length === 0) errors.teammates = "Add at least one teammate.";
  else if (input.teammates.length > L.maxMembers) errors.teammates = `Teams can have up to ${L.maxMembers} people.`;
  else if (input.teammates.some((n) => n.length > L.memberName)) errors.teammates = `Keep each name under ${L.memberName} characters.`;

  if (!input.description) errors.description = "Tell us what you made.";
  else if (input.description.length > L.description) errors.description = `Keep it under ${L.description} characters.`;

  const repo = httpUrl(input.githubUrl);
  if (!input.githubUrl) errors.githubUrl = "Add a link to your GitHub repo.";
  else if (input.githubUrl.length > L.url || !repo || repo.hostname !== "github.com" || repo.pathname.split("/").filter(Boolean).length < 2)
    errors.githubUrl = "Use a full repo link, like https://github.com/team/project.";

  if (!input.demoUrl) errors.demoUrl = "Add a link to where your project is hosted.";
  else if (input.demoUrl.length > L.url || !httpUrl(input.demoUrl)) errors.demoUrl = "Use a full link starting with https://.";

  if (!input.aiDeclaration) errors.aiDeclaration = "Tell us where you used AI, or write “No AI used”.";
  else if (input.aiDeclaration.length > L.aiDeclaration) errors.aiDeclaration = `Keep it under ${L.aiDeclaration} characters.`;

  return errors;
}

/** Checks the file's first bytes rather than trusting the browser-reported type. */
export function sniffImage(bytes: Uint8Array): ImageExt | null {
  const starts = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (starts([0xff, 0xd8, 0xff])) return "jpg";
  if (starts([0x47, 0x49, 0x46, 0x38])) return "gif";
  if (starts([0x52, 0x49, 0x46, 0x46]) && starts([0x57, 0x45, 0x42, 0x50], 8)) return "webp";
  return null;
}
