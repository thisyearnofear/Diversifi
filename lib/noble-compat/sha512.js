// Noble hashes v1.7.1 compatibility shim for sha512.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const sha512Module = require("@noble/hashes/sha512");

  // Export all functions
  module.exports = {
    sha512: sha512Module.sha512,
    sha384: sha512Module.sha384,
    SHA512: sha512Module.SHA512,
    SHA384: sha512Module.SHA384,
    // Export everything else as well
    ...sha512Module,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/sha512:", error.message);
  // Provide empty exports as fallback
  module.exports = {};
}
