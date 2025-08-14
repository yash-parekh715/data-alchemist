import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Ignore TS type errors during `next build` (optional, speeds submission)
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig as any;
