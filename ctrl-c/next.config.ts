import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Dev-only Next.js badge. Visitors on the live site never see it; hide it in `next dev` too.
  devIndicators: false,
  experimental: {
    serverActions: {
      // Hackathon cover images are capped at 5 MB, plus room for the other fields.
      bodySizeLimit: "6mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
