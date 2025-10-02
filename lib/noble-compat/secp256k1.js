// Noble curves v1.9.7 compatibility shim for secp256k1.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const secp256k1Module = require("@noble/curves/secp256k1");

  // Create enhanced secp256k1 object with all required methods
  const secp256k1 = {
    ...secp256k1Module.secp256k1,
    isValidPrivateKey: secp256k1Module.secp256k1?.utils?.isValidPrivateKey || 
                      secp256k1Module.secp256k1?.isValidPrivateKey ||
                      secp256k1Module.utils?.isValidPrivateKey ||
                      ((key) => {
                        try {
                          if (!key) return false;
                          const keyBytes = typeof key === 'string' ? 
                            new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))) : 
                            key;
                          return keyBytes.length === 32 && keyBytes.some(b => b !== 0);
                        } catch {
                          return false;
                        }
                      }),
    utils: {
      ...secp256k1Module.secp256k1?.utils,
      ...secp256k1Module.utils,
      isValidPrivateKey: secp256k1Module.secp256k1?.utils?.isValidPrivateKey || 
                        secp256k1Module.secp256k1?.isValidPrivateKey ||
                        secp256k1Module.utils?.isValidPrivateKey ||
                        ((key) => {
                          try {
                            if (!key) return false;
                            const keyBytes = typeof key === 'string' ? 
                              new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))) : 
                              key;
                            return keyBytes.length === 32 && keyBytes.some(b => b !== 0);
                          } catch {
                            return false;
                          }
                        }),
    }
  };

  // Export all functions that ethers expects
  module.exports = {
    secp256k1,
    // Also export at top level for compatibility
    isValidPrivateKey: secp256k1.isValidPrivateKey,
    utils: secp256k1.utils,
    // Export everything else as well
    ...secp256k1Module,
  };
} catch (error) {
  console.error("Failed to load @noble/curves/secp256k1:", error.message);
  
  // Provide comprehensive fallback
  const fallbackSecp256k1 = {
    isValidPrivateKey: (key) => {
      try {
        if (!key) return false;
        const keyBytes = typeof key === 'string' ? 
          new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))) : 
          key;
        return keyBytes.length === 32 && keyBytes.some(b => b !== 0);
      } catch {
        return false;
      }
    },
    utils: {
      isValidPrivateKey: (key) => {
        try {
          if (!key) return false;
          const keyBytes = typeof key === 'string' ? 
            new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16))) : 
            key;
          return keyBytes.length === 32 && keyBytes.some(b => b !== 0);
        } catch {
          return false;
        }
      }
    }
  };

  module.exports = {
    secp256k1: fallbackSecp256k1,
    isValidPrivateKey: fallbackSecp256k1.isValidPrivateKey,
    utils: fallbackSecp256k1.utils,
  };
}
