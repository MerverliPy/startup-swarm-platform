import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: false,
  },
  allowedDevOrigins: [
    "http://100.81.83.98:3001",
    "http://localhost:3001",
  ],
};

export default nextConfig;
