// Noble hashes v1.7.1 compatibility shim for scrypt.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const scryptModule = require("@noble/hashes/scrypt");

  // Export all functions that ethers expects
  module.exports = {
    scrypt: scryptModule.scrypt,
    scryptAsync: scryptModule.scryptAsync,
    // Export everything else as well
    ...scryptModule,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/scrypt:", error.message);
  // Provide empty exports as fallback
  module.exports = {};
}
