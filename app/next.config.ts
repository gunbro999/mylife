import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // PWA manifest is served from public/manifest.json
  // Service worker is handled by @serwist/next
};

export default nextConfig;
