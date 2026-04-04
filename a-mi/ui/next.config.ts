import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIST_DIR || ".next",
};

export default nextConfig;
