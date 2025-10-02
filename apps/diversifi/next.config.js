/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@diversifi/mento-utils"
  ],
  // We'll add shared packages here as we extract them

  // Configure base path if needed
  // basePath: '/diversifi',

  // Configure asset prefix if needed
  // assetPrefix: '/diversifi',

  // Configure redirects
  async redirects() {
    return [
      {
        source: "/diversifi/index",
        destination: "/diversifi",
        permanent: true,
      },
    ];
  },

  // Configure headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Allow embedding in MiniPay
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            // Add Content-Security-Policy to allow MiniPay embedding
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' *.minipay.app *.celo.org *.opera.com;",
          },
        ],
      },
    ];
  },

  // Noble hashes v1.7.1 compatibility + Force viem version consistency
  webpack: (config, { isServer }) => {
    const path = require("path");

    // Basic polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        buffer: require.resolve("buffer/"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        crypto: require.resolve("crypto-browserify"),
      };
    }

    // Force viem version consistency and Noble compatibility
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force consistent viem version across all dependencies
      "viem": path.resolve("../../node_modules/viem"),

      // Essential Noble compatibility - only what's needed for build
      "@noble/hashes/hmac.js": path.resolve("../../lib/noble-compat/hmac.js"),
      "@noble/hashes/sha2.js": path.resolve("../../lib/noble-compat/sha2.js"),
      "@noble/hashes/utils.js": path.resolve("../../lib/noble-compat/utils.js"),
    };

    // Ignore problematic modules during build
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push(
        "@safe-global/protocol-kit",
        "@zoralabs/protocol-sdk",
        "connectkit",
      );
    }

    // Handle ESM modules and force module resolution
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    // Additional rule to handle viem resolution consistency
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules.*viem/,
      resolve: {
        alias: {
          "viem": path.resolve("../../node_modules/viem"),
        }
      },
    });

    return config;
  },
};

module.exports = nextConfig;
