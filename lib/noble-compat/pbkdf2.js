// Noble hashes v1.7.1 compatibility shim for pbkdf2.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const pbkdf2Module = require("@noble/hashes/pbkdf2");

  // Export all functions
  module.exports = {
    pbkdf2: pbkdf2Module.pbkdf2,
    pbkdf2Async: pbkdf2Module.pbkdf2Async,
    // Export everything else as well
    ...pbkdf2Module,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/pbkdf2:", error.message);
  // Provide empty exports as fallback
  module.exports = {};
}
