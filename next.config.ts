import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['twitter-api-v2'],
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'ipfs.io',
      },
      {
        hostname: 'i.imgur.com',
      },
      {
        hostname: 'api.hey.xyz',
      },
      {
        hostname: 'euc.li',
      },
      {
        hostname: 'pbs.twimg.com',
      },
      {
        hostname: '*.infura-ipfs.io',
      },
      {
        hostname: '*.pinata.cloud',
      },
      {
        hostname: '*.arweave.net',
      },
      {
        hostname: '*.cloudfront.net',
      },
    ],
  },

  skipTrailingSlashRedirect: true,
  output: 'standalone',
};

export default nextConfig;
