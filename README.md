# Ctrl C — website

The homepage for **Ctrl C**, a student-led community for building, engineering, technology, creativity and collaboration, founded by Dhrupad Patel.

Built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 and React Three Fiber.

## Run it

```bash
cd ctrl-c
npm install
npm run dev        # http://localhost:3000
```

| Command         | What it does                                  |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Local dev server                              |
| `npm run build` | Production build (also type-checks)           |
| `npm run start` | Serve the production build                    |
| `npm run lint`  | ESLint (Next.js + React Compiler rules)       |
| `npx tsc --noEmit` | Type-check only                            |

## Where things live

```
src/
  content/
    site.ts        ← links, contact, socials, HACKATHON_URL, site facts
    events.ts      ← the typed event list
    copy.ts        ← every line of page copy
  app/
    globals.css    ← design tokens (both themes), type scale, component styles
    layout.tsx     ← fonts, metadata, theme bootstrap script
    page.tsx       ← section order + JSON-LD
    admin/         ← the private admin panel (login, submissions, CSV export)
    opengraph-image.tsx, icon.svg, robots.ts, sitemap.ts
  actions/         ← Server Actions: interest form, admin sign-in and edits
  proxy.ts         ← keeps signed-out visitors out of /admin
  components/
    sections/      ← one file per homepage section
    hero/          ← 3D workbench (WorkbenchCanvas), SVG fallback (WorkbenchDrawing),
                     shared scene layout (layout.ts) and per-theme scene palette
    art/           ← procedural SVG artwork (exploded build session, construction "C")
    gallery/       ← the pinned-sheet illustrations and tilt behaviour
    layout/        ← header, mobile menu, theme toggle, footer
  lib/             ← theme store, media-query hooks, isometric projection helper,
                     submission store, admin session, rate limiting
```

### Editing copy

All text is in `src/content/copy.ts`. Components only render it, so wording changes never touch layout code.

### Design tokens

Colours, surfaces and the fluid type scale are CSS custom properties at the top of `src/app/globals.css`: `:root` for dark, the default, and `[data-theme="light"]` for light. Tailwind reads them through the `@theme inline` block, so utilities like `text-violet-ink` or `bg-sunken` follow the active theme.

The 3D scene doesn't read CSS. Its materials and lights for each theme are in `src/components/hero/scene-palette.ts`.

### Artwork

Every visual is code. There are no stock images or photos.

- **Hero bench (3D):** `src/components/hero/WorkbenchCanvas.tsx`.
- **Hero bench (fallback):** `src/components/hero/WorkbenchDrawing.tsx`, an isometric SVG drawn from the same `layout.ts` coordinates, so the two stay in sync.
- **Section art:** `src/components/art/`.
- **Gallery sheets:** `src/components/gallery/pieces.tsx`. Placement and rotation are in the `wall` array in `src/components/sections/Gallery.tsx`.

The gallery is labelled on the page as illustrations, not real projects. When real work exists, replace the sheets with photos and remove the disclaimer in `copy.ts` (`gallery.disclaimer`).

## The hackathon link

**`src/content/site.ts` → `HACKATHON_URL`**

```ts
export const HACKATHON_URL: string | undefined = "https://your-hackathon-site.example";
```

While it's `undefined`, the Events section shows a non-interactive "In the works / Details coming soon" status. Once it's set, the first event shows a real **View event details** button. External URLs open in a new tab, and screen readers announce that.

## Adding or changing events

Edit the `events` array in `src/content/events.ts`. Each entry is a typed `CtrlEvent`:

```ts
{
  id: "spring-build-night",          // unique, stable
  title: "Spring build night",
  type: "Build session",
  description: "One sentence about it.",
  status: "announced",               // "in-the-works" | "announced" | "past"
  dateLabel: "Fri 14 March, 6pm",    // optional, shown as written
  locationLabel: "Room 2.04",        // optional
  artwork: "construction-c",         // optional
  href: "https://…",                 // optional — real link only
}
```

- The **first** event is the featured poster. Any others are listed below it.
- With no `href`, an event renders a status line, never a dead link.
- An **empty array** shows "Nothing on the calendar just yet."

## Contact and socials

Also in `src/content/site.ts`:

- `contact.email`, `contact.interestFormUrl`, `contact.communityUrl`, `contact.supportUrl`
- `socialLinks`: real, active accounts only

Anything set appears automatically as a button under the interest form in **Get involved** and as a link under **Elsewhere** in the footer. Anything left `undefined` stays hidden.

## Interest form and admin panel

The **Get involved** section has a real form: name, email, how they'd like to help (Join, Organize, Mentor, Collaborate, Support) and an optional message. It is validated on the server, has a hidden spam trap, and allows 5 submissions per visitor every 10 minutes.

Submissions are managed at **`/admin`**. Nothing on the public site links there, it isn't in the sitemap or `robots.txt`, and every admin response is marked `noindex`. You type the address yourself:

```
https://your-domain/admin
```

### Setting the username and password

Copy `.env.example` to `.env.local` (local) or add the same variables in your host's dashboard (production):

| Variable               | Purpose                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `ADMIN_USERNAME`       | The admin username. Required.                                                             |
| `ADMIN_PASSWORD`       | The admin password. Required — use something long and random.                             |
| `ADMIN_SESSION_SECRET` | Optional. Signs the login cookie; `openssl rand -hex 32` makes one. Changing it signs everyone out. |
| `DATA_DIR`             | Optional. Folder for `submissions.json`. Default: `./data` (gitignored).                  |

If the username or password is missing, sign-in is disabled. There are no default credentials. Restart the server after changing them.

### What the panel does

- **Sign in / sign out.** Sessions last 8 hours in an httpOnly, `SameSite=Strict` cookie that is only sent to `/admin`. Five wrong attempts lock that visitor out for 15 minutes.
- **Submissions list.** Newest first, with search (name, email, message, note, interests) and status tabs with counts.
- **Detail page.** Full message, a `mailto:` link, status (**New → In review → Contacted → Archived**), a private internal note, and permanent delete for data-removal requests.
- **Export CSV.** Downloads everything as a spreadsheet-safe CSV.

Every admin page, action and the export check the session on the server, not only `proxy.ts`. Times are shown in the server's time zone; set `TZ` (e.g. `TZ=Asia/Kolkata`) to change it.

### Where submissions are stored

They're saved as JSON in `data/submissions.json` on the server's disk. That needs a host with a **persistent filesystem**: a VPS, or Render or Railway with a disk or volume attached. **On Vercel the filesystem is temporary, so submissions would be lost.** To host there, swap `src/lib/submissions.ts` for a database such as Postgres or Supabase. Its five functions are the only thing the rest of the app depends on.

`data/` is gitignored because it contains people's personal details. Back it up like any other private data.

## Theme

Dark is the default. A small inline script in `<head>` applies the saved choice (`localStorage["ctrlc-theme"]`) before first paint, so there is no flash. The toggle updates the page and the 3D scene's lighting and materials.

## 3D and fallbacks

The hero uses one WebGL canvas: DPR capped at 1.75, paused offscreen and in background tabs, with subtle pointer and scroll response on fine pointers only. It falls back to the SVG drawing when:

- WebGL is unavailable, or the context is lost or throws;
- Data Saver is on, or `navigator.deviceMemory` is below 4 GB;
- the URL has `?static`, which is handy for previewing the fallback.

With `prefers-reduced-motion: reduce`, the 3D scene renders a single still frame with no animation and no pointer or scroll response. All CSS scroll reveals are disabled too.

## Deploying

The app lives in the **`ctrl-c/` subfolder** of this repository.

- **A Node server with a persistent disk** (VPS, Render, Railway…), Node 20+: `npm ci && npm run build && npm run start`. Set the variables below and the admin ones above. This is the setup the interest form needs as-is.
- **Vercel:** import the repo, set **Root Directory** to `ctrl-c`, and keep the defaults (framework: Next.js). The site works, but submissions won't persist until `src/lib/submissions.ts` uses a database (see above).

| Variable               | Purpose                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | Production origin, e.g. `https://ctrlc.example` (no trailing slash). Enables the canonical URL, absolute Open Graph URLs, `sitemap.xml` entries and the sitemap line in `robots.txt`. |

No domain is hard-coded. Until the variable is set, the sitemap is empty and Open Graph URLs fall back to Vercel's production URL, or localhost in development.

## Still needed before launch

- [ ] Production domain → `NEXT_PUBLIC_SITE_URL`
- [ ] Hackathon site URL → `HACKATHON_URL`
- [ ] Hackathon name, date and place → `dateLabel` / `locationLabel` in `events.ts` (and `eventsCopy.posterNameNote` in `copy.ts`)
- [ ] Admin username and a strong password → `ADMIN_USERNAME` / `ADMIN_PASSWORD` on the production host
- [ ] A host with a persistent disk for submissions, or a database behind `src/lib/submissions.ts`
- [ ] Optional extra ways to reach you: community link and/or email → `contact` in `site.ts`
- [ ] Social accounts, if any → `socialLinks`
- [ ] Real project photos for the gallery, when they exist
- [ ] Any founder or organization details beyond the name, if wanted in **Our story**

Nothing on the site invents members, stats, events, sponsors, testimonials or contact details. Keep it that way as content arrives.
# CTRL-C
