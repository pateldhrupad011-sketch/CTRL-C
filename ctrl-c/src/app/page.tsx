import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { Events } from "@/components/sections/Events";
import { Gallery } from "@/components/sections/Gallery";
import { Story } from "@/components/sections/Story";
import { GetInvolved } from "@/components/sections/GetInvolved";
import { site } from "@/content/site";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  description: site.positioning,
  founder: { "@type": "Person", name: site.founder },
  ...(site.url ? { url: site.url } : {}),
};

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Suspense fallback={<div className="min-h-[90vh]" aria-hidden="true" />}>
          <WhatWeDo />
        </Suspense>
        <Suspense fallback={<div className="min-h-[90vh]" aria-hidden="true" />}>
          <Events />
        </Suspense>
        <Gallery />
        <Story />
        <GetInvolved />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
