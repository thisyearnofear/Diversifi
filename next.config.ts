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
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/'),
      crypto: require.resolve('crypto-browserify'),
    };
    return config;
  },
  skipTrailingSlashRedirect: true,
  output: 'standalone',
};

export default nextConfig;
