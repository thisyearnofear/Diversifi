// Noble hashes v1.7.1 compatibility shim for hmac.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const hmacModule = require("@noble/hashes/hmac");

  // Export all functions that ethers expects
  module.exports = {
    hmac: hmacModule.hmac,
    HMAC: hmacModule.HMAC,
    // Export everything else as well
    ...hmacModule,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/hmac:", error.message);
  // Provide empty exports as fallback
  module.exports = {};
}
