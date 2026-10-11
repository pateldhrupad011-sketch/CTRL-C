import type { CSSProperties, ReactNode } from "react";
import { gallery } from "@/content/copy";
import { SectionMarker } from "@/components/ui/SectionMarker";
import { TiltPiece } from "@/components/gallery/TiltPiece";
import {
  BreadboardSheet,
  CodeSheet,
  CollabSheet,
  GearSheet,
  GraphSheet,
  TypeSheet,
} from "@/components/gallery/pieces";

type Placement = { x: string; y: string; w: string; rot: string };

const wall: {
  id: string;
  label: string;
  note: string;
  art: ReactNode;
  at: Placement;
  tape: CSSProperties[];
}[] = [
  {
    id: "code",
    label: "05.1 · Code",
    note: "copy, improve, repeat",
    art: <CodeSheet />,
    at: { x: "0%", y: "4%", w: "35%", rot: "-2.4deg" },
    tape: [{ top: "-0.7rem", left: "12%", rotate: "-6deg" }],
  },
  {
    id: "engineering",
    label: "05.2 · Engineering",
    note: "drawn before it’s cut",
    art: <GearSheet />,
    at: { x: "36.5%", y: "0%", w: "24.5%", rot: "2deg" },
    tape: [{ top: "-0.7rem", right: "14%", rotate: "5deg" }],
  },
  {
    id: "design",
    label: "05.3 · Design",
    note: "this site’s own palette",
    art: <TypeSheet />,
    at: { x: "62%", y: "5%", w: "34%", rot: "-1.2deg" },
    tape: [
      { top: "-0.6rem", left: "-1.2rem", rotate: "-38deg" },
      { top: "-0.6rem", right: "-1.2rem", rotate: "38deg" },
    ],
  },
  {
    id: "prototyping",
    label: "05.4 · Prototyping",
    note: "it blinks. that’s a start.",
    art: <BreadboardSheet />,
    at: { x: "3%", y: "54%", w: "37%", rot: "1.4deg" },
    tape: [{ top: "-0.7rem", left: "42%", rotate: "-3deg" }],
  },
  {
    id: "collaboration",
    label: "05.5 · Collaboration",
    note: "two heads, one board",
    art: <CollabSheet />,
    at: { x: "38%", y: "49%", w: "25%", rot: "-2.8deg" },
    tape: [{ top: "-0.7rem", left: "30%", rotate: "4deg" }],
  },
  {
    id: "experimentation",
    label: "05.6 · Experimentation",
    note: "seven tries, one win",
    art: <GraphSheet />,
    at: { x: "64%", y: "54%", w: "32%", rot: "2.4deg" },
    tape: [{ top: "-0.7rem", right: "20%", rotate: "-5deg" }],
  },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-title"
      className="relative overflow-clip border-t border-line bg-sunken py-24 md:py-32"
    >
      <div className="wrap">
        <SectionMarker sheet="05" label="Maker gallery" note="Illustrations · placeholder wall" />

        <div className="mt-14 grid gap-8 md:mt-20 lg:grid-cols-12 lg:items-end">
          <h2 id="gallery-title" className="display reveal text-[length:var(--step-xxl)] lg:col-span-6">
            {gallery.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="reveal lg:col-span-5 lg:col-start-8">
            <p className="prose-c text-[1.12rem]">{gallery.intro}</p>
            <p className="mono mt-5 flex gap-3 border-l-2 border-lime-ink pl-3 normal-case tracking-[0.02em] text-muted">
              {gallery.disclaimer}
            </p>
          </div>
        </div>

        <div className="wall mt-16 md:mt-24">
          {wall.map((p) => (
            <TiltPiece
              key={p.id}
              className="reveal"
              style={
                {
                  "--x": p.at.x,
                  "--y": p.at.y,
                  "--w": p.at.w,
                  "--rot": p.at.rot,
                } as CSSProperties
              }
              tape={p.tape}
              caption={
                <>
                  <span className="text-fg">{p.label}</span>
                  <span className="hidden text-right sm:inline">{p.note}</span>
                </>
              }
            >
              {p.art}
            </TiltPiece>
          ))}
        </div>
      </div>
    </section>
  );
}
