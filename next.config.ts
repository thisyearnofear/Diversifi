import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['twitter-api-v2'],
  images: {
    remotePatterns: [
      { hostname: 'avatar.vercel.sh' },
      { hostname: 'ipfs.io' },
      { hostname: 'i.imgur.com' },
      { hostname: 'api.hey.xyz' },
      { hostname: 'euc.li' },
      { hostname: 'pbs.twimg.com' },
      { hostname: '*.infura-ipfs.io' },
      { hostname: '*.pinata.cloud' },
      { hostname: '*.arweave.net' },
      { hostname: '*.cloudfront.net' },
    ],
  },
  webpack: (config, { isServer }) => {
    const path = require('path');
    
    // Basic polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
      };
    }
    
    // Noble packages are now patched directly via postinstall script
    
    // Ignore problematic modules during build
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push(
        '@safe-global/protocol-kit',
        '@zoralabs/protocol-sdk',
        'connectkit'
      );
    }
    
    // Handle ESM modules and ignore parse errors in noble packages
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    // Ignore webpack warnings for noble packages
    config.ignoreWarnings = [
      /Module parse failed.*@noble/,
      /Identifier.*has already been declared/,
    ];
    
    return config;
  },
  skipTrailingSlashRedirect: true,
  output: 'standalone',
  // experimental: {
  //   esmExternals: 'loose', // Removed - not supported by Turbopack and no longer needed
  // },
};

export default nextConfig;
