import { HACKATHON_URL } from "./site";

/**
 * ──────────────────────────────────────────────────────────────────
 *  EVENTS
 *
 *  Defaults for the homepage poster. Admins can change the live copy
 *  and status from /admin/activities; those edits live in DATA_DIR.
 * ──────────────────────────────────────────────────────────────────
 */

export const EVENT_STATUSES = [
  "Planned",
  "In the works",
  "Announced",
  "Registration open",
  "Happening now",
  "Finished",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type EventArtwork = "construction-c";

export interface CtrlEvent {
  id: string;
  title: string;
  type: string;
  description: string;
  status: EventStatus;
  dateLabel?: string;
  locationLabel?: string;
  artwork?: EventArtwork;
  href?: string;
}

export const events: CtrlEvent[] = [
  {
    id: "first-hackathon",
    title: "Our first hackathon",
    type: "Hackathon",
    description: "Our first hackathon is in the works. Details will be announced here.",
    status: "In the works",
    artwork: "construction-c",
    href: HACKATHON_URL,
  },
];
