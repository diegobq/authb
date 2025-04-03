import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_HOSTNAME: process.env.VERCEL_URL
      ? process.env.VERCEL_URL
      : "localhost",
    NEXT_PUBLIC_ORIGIN: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  },
};

export default nextConfig;
