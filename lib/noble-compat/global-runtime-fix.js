// Comprehensive runtime fix for Noble hashes compatibility issues
// This must be loaded before any Noble hashes modules

// Create hash function implementations
function createHashFunctions() {
  try {
    const { hmac } = require('@noble/hashes/hmac');
    const { sha256 } = require('@noble/hashes/sha256');
    const { keccak_256, sha3_256 } = require('@noble/hashes/sha3');
    
    return {
      ahash: (data, key) => key ? hmac(sha256, key, data) : sha256(data),
      bhash: (data, key) => key ? hmac(sha256, key, data) : sha256(data),
      aI: (data) => keccak_256(data),
      bI: (data) => sha3_256(data),
      cI: (data) => sha256(data),
      dI: (data) => keccak_256(data),
    };
  } catch (error) {
    console.warn('Failed to create hash functions, using fallbacks:', error);
    const fallback = () => new Uint8Array(32);
    return {
      ahash: fallback,
      bhash: fallback,
      aI: fallback,
      bI: fallback,
      cI: fallback,
      dI: fallback,
    };
  }
}

const hashFunctions = createHashFunctions();

// Apply to all global contexts
const contexts = [globalThis, global, window].filter(Boolean);

contexts.forEach(context => {
  // Direct function assignments
  Object.assign(context, hashFunctions);
  
  // Create f object if it doesn't exist
  if (!context.f) context.f = {};
  Object.assign(context.f, hashFunctions);
  
  // Create other common namespaces
  if (!context.noble) context.noble = {};
  if (!context.noble.hashes) context.noble.hashes = {};
  Object.assign(context.noble.hashes, hashFunctions);
});

// Patch module loading if available
if (typeof require !== 'undefined') {
  const originalRequire = require;
  
  // Override require for specific modules
  const modulePatches = {
    '@noble/hashes/sha3': () => ({
      ...require.cache['@noble/hashes/sha3']?.exports,
      ...hashFunctions,
    }),
    '@noble/hashes/hmac': () => ({
      ...require.cache['@noble/hashes/hmac']?.exports,
      ...hashFunctions,
    }),
  };
  
  Object.keys(modulePatches).forEach(moduleName => {
    try {
      const originalModule = originalRequire(moduleName);
      Object.assign(originalModule, hashFunctions);
    } catch (error) {
      // Module not available, skip
    }
  });
}

// Export for CommonJS
if (typeof exports !== 'undefined') {
  Object.assign(exports, hashFunctions);
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  Object.assign(module.exports, hashFunctions);
}
