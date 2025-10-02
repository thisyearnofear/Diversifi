// Noble hashes v1.7.1 compatibility shim for legacy.js
// Re-exports ripemd160 for @scure/bip32 compatibility

try {
  // Direct static require
  const ripemd160Module = require("@noble/hashes/ripemd160");

  // Export all functions
  module.exports = {
    ripemd160: ripemd160Module.ripemd160,
    RIPEMD160: ripemd160Module.RIPEMD160,
    // Export everything else as well
    ...ripemd160Module,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/ripemd160:", error.message);
  // Provide empty exports as fallback
  module.exports = {};
}
