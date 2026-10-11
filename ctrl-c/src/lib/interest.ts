import { involve } from "@/content/copy";

/** The "how would you like to help" choices, taken from the Get Involved list. */
export const INTEREST_OPTIONS = involve.ways.map((w) => w.word);
export type Interest = (typeof INTEREST_OPTIONS)[number];

export const SUBMISSION_STATUSES = ["new", "in-review", "contacted", "archived"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const statusLabel: Record<SubmissionStatus, string> = {
  new: "New",
  "in-review": "In review",
  contacted: "Contacted",
  archived: "Archived",
};

export const LIMITS = {
  name: 100,
  email: 200,
  phone: 30,
  linkedin: 300,
  website: 300,
  message: 1000,
  note: 2000,
  resumeBytes: 5 * 1024 * 1024,
} as const;

export const RESUME_TYPES = {
  pdf: "pdf",
  docx: "docx",
  doc: "doc",
} as const;

export type ResumeExt = (typeof RESUME_TYPES)[keyof typeof RESUME_TYPES];

export type InterestInput = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  interests: string[];
  message: string;
};

export type FieldErrors = Partial<
  Record<"name" | "email" | "phone" | "linkedin" | "website" | "resume" | "interests" | "message", string>
>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+]?[\d\s().-]{7,30}$/;

function httpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export function validateInterest(input: InterestInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.name) errors.name = "Tell us your name.";
  else if (input.name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  if (!input.email) errors.email = "We need an email to reach you.";
  else if (input.email.length > LIMITS.email || !EMAIL.test(input.email)) errors.email = "That email doesn’t look right.";

  const digits = input.phone.replace(/\D/g, "");
  if (!input.phone) errors.phone = "We need a phone number to reach you.";
  else if (input.phone.length > LIMITS.phone || !PHONE.test(input.phone) || digits.length < 7 || digits.length > 15) {
    errors.phone = "That number doesn’t look right.";
  }

  if (input.linkedin) {
    const linkedin = httpUrl(input.linkedin);
    if (
      input.linkedin.length > LIMITS.linkedin ||
      !linkedin ||
      !linkedin.hostname.replace(/^www\./, "").endsWith("linkedin.com")
    ) {
      errors.linkedin = "Use a full LinkedIn link, like https://www.linkedin.com/in/your-name.";
    }
  }

  if (input.website) {
    const website = httpUrl(input.website);
    if (input.website.length > LIMITS.website || !website) {
      errors.website = "Use a full link, like https://your-site.com.";
    }
  }

  if (input.interests.some((i) => !INTEREST_OPTIONS.includes(i))) errors.interests = "Pick from the list.";

  if (input.message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;
  return errors;
}

export function sniffResume(bytes: Uint8Array): ResumeExt | null {
  const starts = (sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts([0x25, 0x50, 0x44, 0x46])) return "pdf";
  if (starts([0xd0, 0xcf, 0x11, 0xe0])) return "doc";
  if (starts([0x50, 0x4b, 0x03, 0x04]) || starts([0x50, 0x4b, 0x05, 0x06]) || starts([0x50, 0x4b, 0x07, 0x08])) {
    return "docx";
  }
  return null;
}
