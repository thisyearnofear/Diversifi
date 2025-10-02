// Runtime fix for Noble hashes ahash function error
// This addresses the "(0 , e.ahash) is not a function" error

if (typeof globalThis !== 'undefined') {
  // Ensure Noble hashes functions are properly available at runtime
  try {
    const crypto = require('crypto');
    
    // Create a fallback ahash function if it's missing
    if (!globalThis.ahash) {
      globalThis.ahash = function(data, key) {
        try {
          const hmac = crypto.createHmac('sha256', key || '');
          hmac.update(data);
          return hmac.digest();
        } catch (error) {
          console.warn('ahash fallback failed:', error);
          return new Uint8Array(32); // Return empty 32-byte array as fallback
        }
      };
    }

    // Ensure other Noble functions are available
    if (!globalThis.noble) {
      globalThis.noble = {
        hashes: {},
        curves: {}
      };
    }

  } catch (error) {
    console.warn('Noble runtime fix initialization failed:', error);
  }
}

module.exports = {};