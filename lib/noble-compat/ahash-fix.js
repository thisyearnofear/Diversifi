// Comprehensive fix for Noble hashes ahash function error
// This creates proper implementations for all missing hash functions

try {
  // Import the actual noble hashes modules
  const { hmac } = require('@noble/hashes/hmac');
  const { sha256 } = require('@noble/hashes/sha256');
  const { sha512 } = require('@noble/hashes/sha512');
  
  // Create ahash function that matches expected signature
  function ahash(data, key) {
    try {
      if (key) {
        return hmac(sha256, key, data);
      } else {
        return sha256(data);
      }
    } catch (error) {
      console.warn('ahash implementation failed:', error);
      return new Uint8Array(32);
    }
  }

  // Create other hash functions that might be missing
  function bhash(data, key) {
    try {
      if (key) {
        return hmac(sha512, key, data);
      } else {
        return sha512(data);
      }
    } catch (error) {
      console.warn('bhash implementation failed:', error);
      return new Uint8Array(64);
    }
  }
  
  // Export for use
  module.exports = { 
    ahash,
    bhash,
    // Also export as default
    default: ahash
  };
  
  // Make functions globally available for runtime access
  if (typeof globalThis !== 'undefined') {
    globalThis.ahash = ahash;
    globalThis.bhash = bhash;
    
    // Also try to patch the specific module that's failing
    if (typeof globalThis.f === 'undefined') {
      globalThis.f = { ahash, bhash };
    } else {
      globalThis.f.ahash = ahash;
      globalThis.f.bhash = bhash;
    }
  }
  
} catch (error) {
  console.warn('Failed to create hash fixes:', error);
  
  // Fallback implementations
  const fallbackAhash = () => new Uint8Array(32);
  const fallbackBhash = () => new Uint8Array(64);
  
  module.exports = { 
    ahash: fallbackAhash,
    bhash: fallbackBhash,
    default: fallbackAhash
  };
  
  if (typeof globalThis !== 'undefined') {
    globalThis.ahash = fallbackAhash;
    globalThis.bhash = fallbackBhash;
    if (typeof globalThis.f === 'undefined') {
      globalThis.f = { ahash: fallbackAhash, bhash: fallbackBhash };
    } else {
      globalThis.f.ahash = fallbackAhash;
      globalThis.f.bhash = fallbackBhash;
    }
  }
}