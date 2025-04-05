import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["twitter-api-v2"],
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
