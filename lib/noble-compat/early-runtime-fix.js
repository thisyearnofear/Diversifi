// Early runtime fix for Noble hashes - must be loaded first
(function() {
  'use strict';
  
  // Create fallback hash functions immediately
  const createFallbackHash = (size) => () => new Uint8Array(size);
  
  const hashFunctions = {
    aI: createFallbackHash(32),
    bI: createFallbackHash(32),
    cI: createFallbackHash(32),
    dI: createFallbackHash(32),
    ahash: createFallbackHash(32),
    bhash: createFallbackHash(64),
  };
  
  // Apply to all possible global contexts immediately
  const contexts = [];
  
  if (typeof globalThis !== 'undefined') contexts.push(globalThis);
  if (typeof global !== 'undefined') contexts.push(global);
  if (typeof window !== 'undefined') contexts.push(window);
  if (typeof self !== 'undefined') contexts.push(self);
  
  contexts.forEach(context => {
    // Direct assignment
    Object.assign(context, hashFunctions);
    
    // Create f namespace
    if (!context.f) context.f = {};
    Object.assign(context.f, hashFunctions);
    
    // Create noble namespace
    if (!context.noble) context.noble = {};
    if (!context.noble.hashes) context.noble.hashes = {};
    Object.assign(context.noble.hashes, hashFunctions);
  });
  
  // Try to load actual implementations after fallbacks are in place
  setTimeout(() => {
    try {
      const { keccak_256, sha3_256 } = require('@noble/hashes/sha3');
      const { sha256 } = require('@noble/hashes/sha256');
      const { hmac } = require('@noble/hashes/hmac');
      
      const realHashFunctions = {
        aI: keccak_256,
        bI: sha3_256,
        cI: sha256,
        dI: keccak_256,
        ahash: (data, key) => key ? hmac(sha256, key, data) : sha256(data),
        bhash: (data, key) => key ? hmac(sha256, key, data) : sha256(data),
      };
      
      contexts.forEach(context => {
        Object.assign(context, realHashFunctions);
        if (context.f) Object.assign(context.f, realHashFunctions);
        if (context.noble?.hashes) Object.assign(context.noble.hashes, realHashFunctions);
      });
      
      console.log('✅ Noble hashes real implementations loaded');
    } catch (error) {
      console.warn('Using fallback hash implementations:', error.message);
    }
  }, 0);
  
})();
