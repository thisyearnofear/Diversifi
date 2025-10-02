import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["twitter-api-v2"],
  images: {
    remotePatterns: [
      { hostname: "avatar.vercel.sh" },
      { hostname: "ipfs.io" },
      { hostname: "i.imgur.com" },
      { hostname: "api.hey.xyz" },
      { hostname: "euc.li" },
      { hostname: "pbs.twimg.com" },
      { hostname: "*.infura-ipfs.io" },
      { hostname: "*.pinata.cloud" },
      { hostname: "*.arweave.net" },
      { hostname: "*.cloudfront.net" },
    ],
  },
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

    // Noble hashes v1.7.1 compatibility - map missing exports to our shims
    config.resolve.alias = {
      ...config.resolve.alias,
      "@noble/hashes/hmac.js": path.resolve("./lib/noble-compat/hmac.js"),
      "@noble/hashes/sha2.js": path.resolve("./lib/noble-compat/sha2.js"),
      "@noble/hashes/utils.js": path.resolve("./lib/noble-compat/utils.js"),
      "@noble/hashes/utils": path.resolve("./lib/noble-compat/utils.js"),
      "@noble/hashes/legacy": path.resolve("./lib/noble-compat/legacy.js"),
      "@noble/hashes/ripemd160": path.resolve("./lib/noble-compat/ripemd160.js"),
      "@noble/hashes/pbkdf2": path.resolve("./lib/noble-compat/pbkdf2.js"),
      "@noble/hashes/sha256": path.resolve("./lib/noble-compat/sha256.js"),
      "@noble/hashes/sha512": path.resolve("./lib/noble-compat/sha512.js"),
      "@noble/hashes/scrypt": path.resolve("./lib/noble-compat/scrypt.js"),
      "@noble/hashes/sha3": path.resolve("./lib/noble-compat/sha3.js"),
      "@noble/curves/secp256k1": path.resolve("./lib/noble-compat/secp256k1.js"),
      "ahash": path.resolve("./lib/noble-compat/ahash-fix.js"),
      // Target the specific weierstrass curve module that's failing
      "@noble/curves/abstract/weierstrass": path.resolve("./lib/noble-compat/weierstrass-fix.js"),
      // Also target the abstract utils that contain the hash functions
      "@noble/curves/abstract/utils": path.resolve("./lib/noble-compat/curves-utils-fix.js"),
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

    // Add specific webpack plugins to handle Noble hashes runtime issues
    config.plugins = config.plugins || [];
    // Inject early runtime fix
    if (config.entry) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Add early fix to all entry points
        Object.keys(entries).forEach(key => {
          if (Array.isArray(entries[key])) {
            entries[key].unshift('./lib/noble-compat/early-runtime-fix.js');
          } else if (typeof entries[key] === 'string') {
            entries[key] = ['./lib/noble-compat/early-runtime-fix.js', entries[key]];
          }
        });
        
        return entries;
      };
    }

    config.plugins.push(
      new (require('webpack')).DefinePlugin({
        'process.env.NOBLE_HASHES_RUNTIME_FIX': JSON.stringify('true'),
      }),
      // Add a plugin to inject our hash functions globally
      new (require('webpack')).ProvidePlugin({
        'global.f': path.resolve('./lib/noble-compat/global-runtime-fix.js'),
        'globalThis.f': path.resolve('./lib/noble-compat/global-runtime-fix.js'),
        'f': path.resolve('./lib/noble-compat/global-runtime-fix.js'),
        'aI': [path.resolve('./lib/noble-compat/global-runtime-fix.js'), 'aI'],
        'bI': [path.resolve('./lib/noble-compat/global-runtime-fix.js'), 'bI'],
        'ahash': [path.resolve('./lib/noble-compat/global-runtime-fix.js'), 'ahash'],
      }),
      // Custom plugin to fix Noble hashes function calls
      new (require('./lib/noble-compat/webpack-noble-fix-plugin.js'))(),
    );

    // Add runtime fix as a module alias instead of entry modification
    config.resolve.alias = {
      ...config.resolve.alias,
      'noble-runtime-fix': path.resolve('./lib/noble-compat/runtime-fix.js'),
    };

    // Inject the global polyfill at the very beginning
    const originalEntry = config.entry;
    config.entry = async () => {
      const entries = await (typeof originalEntry === 'function' ? originalEntry() : originalEntry || {});
      
      // Ensure entries is an object
      if (typeof entries === 'string') {
        return {
          main: [path.resolve('./lib/noble-compat/global-polyfill.js'), entries]
        };
      }
      
      // Add polyfill to all entry points
      Object.keys(entries).forEach(key => {
        if (Array.isArray(entries[key])) {
          entries[key].unshift(path.resolve('./lib/noble-compat/global-polyfill.js'));
        } else if (typeof entries[key] === 'string') {
          entries[key] = [path.resolve('./lib/noble-compat/global-polyfill.js'), entries[key]];
        }
      });
      
      return entries;
    };

    // Handle ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  skipTrailingSlashRedirect: true,
  output: "standalone",
};

export default nextConfig;
