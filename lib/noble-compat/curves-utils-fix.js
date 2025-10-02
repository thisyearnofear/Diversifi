// Fix for Noble curves abstract utils that contains the hash functions
// This patches the utils module to ensure hash functions are available

try {
  // Import the original utils module
  const utilsModule = require("@noble/curves/abstract/utils");
  
  // Create hash functions using Node.js crypto
  const crypto = require('crypto');
  
  function ahash(data, key) {
    try {
      const hmac = crypto.createHmac('sha256', key || Buffer.alloc(32));
      hmac.update(data);
      return new Uint8Array(hmac.digest());
    } catch (error) {
      console.warn('ahash implementation failed:', error);
      return new Uint8Array(32);
    }
  }

  function bhash(data, key) {
    try {
      const hmac = crypto.createHmac('sha512', key || Buffer.alloc(32));
      hmac.update(data);
      return new Uint8Array(hmac.digest());
    } catch (error) {
      console.warn('bhash implementation failed:', error);
      return new Uint8Array(64);
    }
  }

  // Create a patched version of the utils module
  const patchedUtils = {
    ...utilsModule,
    // Add hash functions directly to utils
    ahash,
    bhash,
    // Create an f object with hash functions
    f: {
      ahash,
      bhash,
      ...utilsModule.f
    },
    // Create an h object with hash functions
    h: {
      ahash,
      bhash,
      ...utilsModule.h
    }
  };

  // Ensure global availability
  if (typeof globalThis !== 'undefined') {
    globalThis.ahash = ahash;
    globalThis.bhash = bhash;
    if (!globalThis.f) globalThis.f = {};
    globalThis.f.ahash = ahash;
    globalThis.f.bhash = bhash;
  }

  // Export the patched module
  module.exports = patchedUtils;
  
} catch (error) {
  console.error("Failed to patch curves utils module:", error.message);
  
  // Fallback: create minimal utils with hash functions
  const crypto = require('crypto');
  
  function ahash(data, key) {
    try {
      const hmac = crypto.createHmac('sha256', key || Buffer.alloc(32));
      hmac.update(data);
      return new Uint8Array(hmac.digest());
    } catch (error) {
      return new Uint8Array(32);
    }
  }

  function bhash(data, key) {
    try {
      const hmac = crypto.createHmac('sha512', key || Buffer.alloc(32));
      hmac.update(data);
      return new Uint8Array(hmac.digest());
    } catch (error) {
      return new Uint8Array(64);
    }
  }

  module.exports = {
    ahash,
    bhash,
    f: { ahash, bhash },
    h: { ahash, bhash }
  };
}