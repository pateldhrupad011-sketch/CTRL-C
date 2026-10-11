import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const alt = "Ctrl C | A student-led community for people who build";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [display, mono] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/BricolageGrotesque-800.woff")),
    readFile(join(process.cwd(), "src/assets/GeistMono-Medium.ttf")),
  ]);

  const grid = "rgba(239,233,221,0.06)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#0c0b10",
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          color: "#efe9dd",
          fontFamily: "Bricolage",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Mono",
            fontSize: 20,
            letterSpacing: 3,
            color: "#aaa49a",
          }}
        >
          <span>CTRL C · STUDENT-LED BUILD COMMUNITY</span>
          <span>REV. A</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 118, lineHeight: 0.9, letterSpacing: -4 }}>
            <span>Good ideas</span>
            <span>don’t build</span>
            <span style={{ color: "#c6f432" }}>themselves.</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              height: 64,
              padding: "0 14px 10px",
              border: "2.5px solid #efe9dd",
              borderRadius: 12,
              fontFamily: "Mono",
              fontSize: 22,
            }}
          >
            ctrl
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 12,
              background: "#6a4bff",
              color: "#fff",
              fontSize: 42,
            }}
          >
            C
          </div>
          <span style={{ marginLeft: 18, fontFamily: "Mono", fontSize: 22, color: "#aaa49a", maxWidth: 760 }}>
            {site.positioning}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: display, weight: 800, style: "normal" },
        { name: "Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
