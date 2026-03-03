import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export (no server required)
  output: "export",
  // Output to 'build' folder instead of default 'out'
  distDir: "build",
};

export default nextConfig;
