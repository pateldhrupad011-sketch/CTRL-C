import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Empty until NEXT_PUBLIC_SITE_URL is set, so no placeholder domain is ever published. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.url) return [];
  return [{ url: site.url, changeFrequency: "monthly", priority: 1 }];
}
