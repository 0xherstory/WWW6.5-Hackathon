import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo：仓库根另有 package-lock.json；从本目录执行 npm 时 cwd 即应用根，避免 Turbopack 误判
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
