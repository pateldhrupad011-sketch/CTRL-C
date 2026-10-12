/**
 * ──────────────────────────────────────────────────────────────────
 *  CTRL C — PAGE COPY
 *
 *  Every sentence on the homepage. This is draft copy written around
 *  confirmed facts only; edit freely. Keep it truthful: no invented
 *  members, numbers, history, partners or dates.
 * ──────────────────────────────────────────────────────────────────
 */

export const nav = [
  { id: "about", label: "About", sheet: "02" },
  { id: "what-we-do", label: "What we do", sheet: "03" },
  { id: "events", label: "Events", sheet: "04" },
  { id: "story", label: "Our story", sheet: "06" },
  { id: "get-involved", label: "Get involved", sheet: "07" },
] as const;

export const footerNav = [
  { id: "about", label: "About" },
  { id: "what-we-do", label: "What we do" },
  { id: "events", label: "Events" },
  { id: "gallery", label: "Maker gallery" },
  { id: "story", label: "Our story" },
  { id: "get-involved", label: "Get involved" },
] as const;

export const hero = {
  kicker: "A student-led community for building, engineering, technology, creativity & collaboration",
  revision: "Rev. A · in the works",
  headline: ["Good ideas", "don’t build", "themselves."],
  description:
    "Ctrl C is a student-led community for curious people who want to build, experiment, and create together.",
  primaryAction: { label: "Explore Ctrl C", href: "#about", hint: "02" },
  secondaryAction: { label: "See what’s next", href: "#events", hint: "04" },
  figure: {
    label: "Fig. 01 · The workbench",
    steps: ["Sketch it", "Build it", "Copy it", "Remix it"],
  },
};

export const about = {
  statement: {
    before: "Ctrl C is a place to ",
    highlight: "learn by making",
    after: ", alongside people who are figuring it out too.",
  },
  body: "Whether you write code, wire circuits, sketch interfaces or just want to know how things work, the idea is simple: make something real, with other people, and learn from every version of it.",
  name: {
    title: "Why “Ctrl C”?",
    body: "Most making starts the same way: copy something that works, take it apart, change it, and keep going until it becomes something new. The name is a nod to that first step, not the last one.",
  },
  principles: [
    {
      title: "Start with curiosity.",
      body: "Every project begins with a question worth chasing. You don’t need the answer to start, just the question.",
    },
    {
      title: "Build with others.",
      body: "Ideas get sharper when they’re shared, questioned and rebuilt by more than one pair of hands.",
    },
    {
      title: "Learn by making.",
      body: "Reading about it helps. Building it teaches. Break it, fix it, then make the next version.",
    },
  ],
};

export const whatWeDo = {
  heading: "The plan, so far.",
  intro:
    "These are the things Ctrl C is setting out to run. None of them have started yet. Each will be announced here when it does.",
  featured: {
    part: "A1",
    title: "Build sessions",
    body: "Open, regular time to work on projects side by side. Bring something half-finished, or start from nothing and leave with a first version.",
    figure: "Fig. A1 · A build session, exploded",
    parts: [
      "An idea (or half of one)",
      "People to build with",
      "Tools & a little help",
      "A few focused hours",
      "Something to show",
    ],
  },
  parts: [
    {
      part: "A2",
      title: "Workshops",
      body: "Short, hands-on introductions to a tool, a technique or an idea, led by whoever knows it best.",
      status: "Planned",
    },
    {
      part: "A3",
      title: "Collaborative projects",
      body: "Bigger builds made by small teams, taken all the way from first sketch to working version.",
      status: "Planned",
    },
    {
      part: "A4",
      title: "Community events",
      body: "Demos, show-and-tells and meetups: a reason to see what everyone has been making.",
      status: "Planned",
    },
    {
      part: "A5",
      title: "Hackathons",
      body: "A focused stretch of time to build something from scratch with a team. The first one is already in the works.",
      status: "In the works",
      link: { label: "See Events", href: "#events" },
    },
  ],
};

export const eventsCopy = {
  heading: ["Something", "worth building", "is coming."],
  emptyHeading: ["Nothing on", "the calendar", "just yet."],
  emptyBody: "Events will be announced here as soon as they’re confirmed.",
  pendingLink: "Details coming soon",
  posterFile: "untitled-hackathon",
  posterFileNote: "unsaved draft",
  posterNameNote: "Name, date & place to be announced",
  moreHeading: "Also on the bench",
};

export const gallery = {
  heading: ["Pinned to", "the wall."],
  intro:
    "Code, engineering, design, prototyping, collaboration, experimentation: the kinds of work Ctrl C wants to make room for.",
  disclaimer:
    "These are illustrations made for this site, not real Ctrl C projects. Once people start building, this wall gets replaced with the real thing.",
};

export const story = {
  heading: "Founded by Dhrupad Patel, Krushna Vaishnav and Ojas Boddula.",
  founders: ["Dhrupad Patel", "Krushna Vaishnav", "Ojas Boddula"],
  paragraphs: [
    "Ctrl C is brand new. It started with a simple intention: make a place where students who like building things can find each other, learn from each other, and make more ambitious things together than they would alone.",
  ],
  log: {
    command: "git log --reverse",
    commit: "commit 0000001 (HEAD → main)",
    authors: ["Dhrupad Patel", "Krushna Vaishnav", "Ojas Boddula"],
    message: ["Start Ctrl C.", "A place to build things", "with other people."],
    next: "next commit: whoever shows up",
  },
};

export const involve = {
  heading: ["There’s room", "at the bench."],
  intro:
    "Ctrl C will need all kinds of people. Here is how you could be part of it once things get going.",
  ways: [
    { word: "Join", body: "Come along to future build sessions, workshops and events." },
    { word: "Organize", body: "Help shape what Ctrl C becomes and run things behind the scenes." },
    { word: "Mentor", body: "Share what you know with people a few steps behind you." },
    { word: "Collaborate", body: "Bring a project, a skill or an idea and team up on it." },
    { word: "Support", body: "Help make future events and resources possible." },
  ],
  form: {
    heading: "Register your interest.",
    intro: "Tell us how you’d like to take part. We’ll get in touch as things get going.",
    privacy: "Only the Ctrl C organizers can see what you send. It’s used to contact you about Ctrl C, nothing else.",
    successHeading: "Got it, thank you.",
    successNote: "Your details reached the Ctrl C organizers. We’ll be in touch when there’s something to join.",
  },
};

export const footer = {
  blurb:
    "A student-led community for building, engineering, technology, creativity, and collaboration.",
  revision: "Rev. A",
};
