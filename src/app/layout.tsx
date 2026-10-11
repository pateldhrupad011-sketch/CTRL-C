import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { HideDevOverlay } from "@/components/HideDevOverlay";
import { InlineScript } from "@/components/InlineScript";
import { DEFAULT_THEME, reloadFromTopScript, themeInitScript } from "@/lib/theme";
import { site } from "@/content/site";
import "./globals.css";

const display = localFont({
  src: "./fonts/BricolageGrotesque-Variable.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

const title = "Ctrl C | A student-led community for people who build";

export const metadata: Metadata = {
  // Unset falls back to Vercel's production URL (or localhost in dev).
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: { default: title, template: "%s · Ctrl C" },
  description: site.description,
  applicationName: site.name,
  alternates: site.url ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description: site.description,
    url: site.url ? "/" : undefined,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0b10",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <InlineScript html={themeInitScript} />
        <InlineScript html={reloadFromTopScript} />
      </head>
      <body>
        <HideDevOverlay />
        {children}
      </body>
    </html>
  );
}
