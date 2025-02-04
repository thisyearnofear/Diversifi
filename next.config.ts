import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ["twitter-api-v2"],
  experimental: {
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatar.vercel.sh",
      },
    ],
  },
};

export default nextConfig;
