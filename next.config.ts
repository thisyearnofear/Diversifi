import type { NextConfig } from 'next';

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
    
    // Add alias for noble packages compatibility - handle both .js and non-.js imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@noble/hashes/utils.js': path.resolve(__dirname, 'lib/noble-compat.ts'),
      '@noble/hashes/utils': path.resolve(__dirname, 'lib/noble-compat.ts'),
    };
    
    // Also add webpack externals to prevent server-side issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@noble/curves': '@noble/curves',
        '@noble/hashes': '@noble/hashes',
        '@scure/bip32': '@scure/bip32',
        '@scure/bip39': '@scure/bip39',
      });
    }
    
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
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
