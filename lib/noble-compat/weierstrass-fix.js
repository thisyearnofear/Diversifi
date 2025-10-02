// Weierstrass curve implementation fix for Noble hashes ahash function error
// This patches the specific weierstrass module that's calling f.ahash

try {
  // Import the original weierstrass module
  const weierstrassModule = require("@noble/curves/abstract/weierstrass");
  
  // Import our hash fixes
  const { ahash } = require("./ahash-fix.js");
  
  // Create a patched version of the module
  const patchedModule = { ...weierstrassModule };
  
  // If the module has a weierstrass function, patch it
  if (patchedModule.weierstrass) {
    const originalWeierstrass = patchedModule.weierstrass;
    
    patchedModule.weierstrass = function(curveDef) {
      // Ensure ahash is available in the context
      const originalF = global.f || {};
      global.f = {
        ...originalF,
        ahash: ahash,
      };
      
      // Call the original function
      const result = originalWeierstrass.call(this, curveDef);
      
      // Patch any returned objects that might need ahash
      if (result && typeof result === 'object') {
        // Ensure the result has access to ahash
        if (result.utils && !result.utils.ahash) {
          result.utils.ahash = ahash;
        }
      }
      
      return result;
    };
  }
  
  // Export the patched module
  module.exports = patchedModule;
  
} catch (error) {
  console.error("Failed to patch weierstrass module:", error.message);
  
  // Fallback: try to load the original module
  try {
    module.exports = require("@noble/curves/abstract/weierstrass");
  } catch (fallbackError) {
    console.error("Failed to load original weierstrass module:", fallbackError.message);
    
    // Ultimate fallback: provide a minimal implementation
    module.exports = {
      weierstrass: () => {
        throw new Error("Weierstrass curves not available");
      }
    };
  }
}