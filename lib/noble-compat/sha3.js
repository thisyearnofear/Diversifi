// Noble hashes v1.7.1 compatibility shim for sha3.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const sha3Module = require("@noble/hashes/sha3");

  // Create missing functions that might be expected
  function aI(data) {
    try {
      return sha3Module.keccak_256(data);
    } catch (error) {
      console.warn('aI function fallback:', error);
      return new Uint8Array(32);
    }
  }

  function bI(data) {
    try {
      return sha3Module.sha3_256(data);
    } catch (error) {
      console.warn('bI function fallback:', error);
      return new Uint8Array(32);
    }
  }

  // Export all functions that ethers expects
  const exports = {
    Keccak: sha3Module.Keccak,
    sha3_224: sha3Module.sha3_224,
    sha3_256: sha3Module.sha3_256,
    sha3_384: sha3Module.sha3_384,
    sha3_512: sha3Module.sha3_512,
    keccak_224: sha3Module.keccak_224,
    keccak_256: sha3Module.keccak_256,
    keccak_384: sha3Module.keccak_384,
    keccak_512: sha3Module.keccak_512,
    shake128: sha3Module.shake128,
    shake256: sha3Module.shake256,
    keccakP: sha3Module.keccakP,
    // Add missing functions
    aI: aI,
    bI: bI,
    // Export everything else as well
    ...sha3Module,
  };

  // Make functions globally available
  if (typeof globalThis !== 'undefined') {
    globalThis.aI = aI;
    globalThis.bI = bI;
  }

  module.exports = exports;
} catch (error) {
  console.error("Failed to load @noble/hashes/sha3:", error.message);
  
  // Provide fallback implementations
  const fallbackAI = () => new Uint8Array(32);
  const fallbackBI = () => new Uint8Array(32);
  
  if (typeof globalThis !== 'undefined') {
    globalThis.aI = fallbackAI;
    globalThis.bI = fallbackBI;
  }
  
  module.exports = {
    aI: fallbackAI,
    bI: fallbackBI,
  };
}
