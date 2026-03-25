import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  server: {
    allowedHosts: [".monkeycode-ai.online"],
  },
};

export default nextConfig;
