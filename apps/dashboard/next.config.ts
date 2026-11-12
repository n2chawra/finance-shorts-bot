import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pages removed on 2026-11-12 (owner): old links land on the page that now holds that information
  async redirects() {
    return [
      { source: "/impact", destination: "/analytics", permanent: false },
      { source: "/runs", destination: "/videos?status=failed", permanent: false },
      { source: "/templates", destination: "/settings", permanent: false },
    ];
  },
};

export default nextConfig;
