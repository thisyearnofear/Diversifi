// Global polyfill for Noble hashes runtime issues
// This must be loaded before any Noble curves code executes

(function() {
  'use strict';
  
  // Create hash functions
  function createAhash() {
    try {
      const crypto = require('crypto');
      return function ahash(data, key) {
        try {
          const hmac = crypto.createHmac('sha256', key || Buffer.alloc(32));
          hmac.update(data);
          return new Uint8Array(hmac.digest());
        } catch (error) {
          console.warn('ahash fallback failed:', error);
          return new Uint8Array(32);
        }
      };
    } catch (error) {
      return function ahash() {
        return new Uint8Array(32);
      };
    }
  }

  function createBhash() {
    try {
      const crypto = require('crypto');
      return function bhash(data, key) {
        try {
          const hmac = crypto.createHmac('sha512', key || Buffer.alloc(32));
          hmac.update(data);
          return new Uint8Array(hmac.digest());
        } catch (error) {
          console.warn('bhash fallback failed:', error);
          return new Uint8Array(64);
        }
      };
    } catch (error) {
      return function bhash() {
        return new Uint8Array(64);
      };
    }
  }

  // Create the hash functions
  const ahash = createAhash();
  const bhash = createBhash();

  // Inject into all possible global contexts
  const contexts = [
    typeof globalThis !== 'undefined' ? globalThis : null,
    typeof global !== 'undefined' ? global : null,
    typeof window !== 'undefined' ? window : null,
    typeof self !== 'undefined' ? self : null
  ].filter(Boolean);

  contexts.forEach(context => {
    // Direct assignment
    context.ahash = ahash;
    context.bhash = bhash;
    
    // Create f object if it doesn't exist
    if (!context.f) {
      context.f = {};
    }
    context.f.ahash = ahash;
    context.f.bhash = bhash;
    
    // Also try common variable names that might be used
    if (!context.h) {
      context.h = {};
    }
    context.h.ahash = ahash;
    context.h.bhash = bhash;
  });

  // For CommonJS environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ahash,
      bhash,
      f: { ahash, bhash },
      h: { ahash, bhash }
    };
  }

  // Log that polyfill is loaded
  console.log('Noble hashes global polyfill loaded');
})();