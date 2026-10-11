/**
 * ──────────────────────────────────────────────────────────────────
 *  CTRL C — SITE CONFIGURATION
 *
 *  Links, contact details and organization facts live here.
 *  Anything left `undefined` (or an empty list) is simply not shown,
 *  and the site falls back to honest "will be announced here" copy.
 * ──────────────────────────────────────────────────────────────────
 */

/**
 * ▶ FUTURE HACKATHON WEBSITE
 *
 * Paste the full URL of the separate hackathon site here, e.g.
 *   export const HACKATHON_URL = "https://hack.example.org";
 *
 * When set, the Events section shows a real "View event details" link.
 * When `undefined`, it shows a non-interactive "Details coming soon".
 */
export const HACKATHON_URL: string | undefined = "/hackathon";

export const site = {
  name: "Ctrl C",
  founder: "Dhrupad Patel",
  positioning:
    "A student-led community for building, engineering, technology, creativity, and collaboration.",
  description:
    "Ctrl C is a student-led community for curious people who want to build, experiment, and create together.",
  /**
   * Production URL, used for canonical links, Open Graph and the sitemap.
   * Set NEXT_PUBLIC_SITE_URL in your hosting environment (no trailing slash).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, ""),
} as const;

/** Leave a value `undefined` until a real destination exists. */
export const contact: {
  email?: string;
  interestFormUrl?: string;
  communityUrl?: string;
  supportUrl?: string;
} = {
  email: "support.ctrlc@gmail.com",
  interestFormUrl: undefined,
  communityUrl: undefined,
  supportUrl: undefined,
};

export const PRIVACY_POLICY_URL =
  "https://docs.google.com/document/d/1KczEgi9OmA_wHWr9XqmoE3hEPorGuYuvm6hFL9p_Vtk/edit?tab=t.0";

export type ContactLink = { label: string; href: string };

/** Footer Contact list. Add more emails, phones or handles here. */
export const contacts: ContactLink[] = [
  { label: "support.ctrlc@gmail.com", href: "mailto:support.ctrlc@gmail.com" },
];

export type SocialLink = { label: string; href: string };

/**
 * Real, active accounts only. Example:
 *   { label: "Instagram", href: "https://instagram.com/your-handle" },
 */
export const socialLinks: SocialLink[] = [];

export type InvolvementLink = { label: string; href: string; note?: string };

/** Everything the "Get involved" section and footer can link to, in display order. */
export function getInvolvementLinks(): InvolvementLink[] {
  const links: (InvolvementLink | false)[] = [
    !!contact.interestFormUrl && {
      label: "Register interest",
      href: contact.interestFormUrl,
      note: "Form",
    },
    !!contact.communityUrl && {
      label: "Join the community",
      href: contact.communityUrl,
      note: "Community",
    },
    !!contact.supportUrl && {
      label: "Support Ctrl C",
      href: contact.supportUrl,
      note: "Support",
    },
    ...socialLinks.map((s) => ({ label: s.label, href: s.href, note: "Social" })),
  ];
  return links.filter((l): l is InvolvementLink => Boolean(l));
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
