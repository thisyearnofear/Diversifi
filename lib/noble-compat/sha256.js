// Noble hashes v1.7.1 compatibility shim for sha256.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const sha256Module = require("@noble/hashes/sha256");

  // Export all functions
  module.exports = {
    sha256: sha256Module.sha256,
    SHA256: sha256Module.SHA256,
    // Export everything else as well
    ...sha256Module,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/sha256:", error.message);
  // Provide empty exports as fallback
  module.exports = {};
}
