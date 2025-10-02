// Noble hashes v1.7.1 compatibility shim for sha2.js
// Direct require to avoid ESM/CJS issues

const path = require("path");

let sha2Module;
try {
  // Try standard require first
  sha2Module = require("@noble/hashes/sha2");
} catch (e) {
  try {
    // Fallback to direct path
    const modulePath = path.resolve(
      __dirname,
      "../../node_modules/.pnpm/@noble+hashes@1.7.1/node_modules/@noble/hashes/sha2.js",
    );
    sha2Module = require(modulePath);
  } catch (e2) {
    // Final fallback to any available @noble/hashes
    try {
      const fs = require("fs");
      const nodeModules = path.resolve(__dirname, "../../node_modules");

      // Look for any @noble/hashes installation
      const possiblePaths = [
        path.join(nodeModules, "@noble/hashes/sha2.js"),
        path.join(
          nodeModules,
          ".pnpm/@noble+hashes@1.7.1/node_modules/@noble/hashes/sha2.js",
        ),
        path.join(nodeModules, ".pnpm/node_modules/@noble/hashes/sha2.js"),
      ];

      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          sha2Module = require(possiblePath);
          break;
        }
      }

      if (!sha2Module) {
        throw new Error("Cannot find @noble/hashes/sha2 module");
      }
    } catch (e3) {
      throw new Error(`Unable to load @noble/hashes/sha2: ${e3.message}`);
    }
  }
}

// Export all the functions that ethers expects
module.exports = {
  sha224: sha2Module.sha224,
  sha256: sha2Module.sha256,
  sha384: sha2Module.sha384,
  sha512: sha2Module.sha512,
  sha512_224: sha2Module.sha512_224,
  sha512_256: sha2Module.sha512_256,
  // Add any other exports
  ...sha2Module,
};
