// Runtime module patching for Noble hashes ahash function
// This patches the webpack module system to inject ahash where needed

// Create the ahash function
function createAhash() {
  try {
    const { hmac } = require('@noble/hashes/hmac');
    const { sha256 } = require('@noble/hashes/sha256');
    
    return function ahash(data, key) {
      if (key) {
        return hmac(sha256, key, data);
      }
      return sha256(data);
    };
  } catch {
    return () => new Uint8Array(32);
  }
}

const ahash = createAhash();

// Patch webpack require if available
if (typeof __webpack_require__ !== 'undefined') {
  const originalRequire = __webpack_require__;
  __webpack_require__ = function(moduleId) {
    const module = originalRequire(moduleId);
    
    // Patch any module that might need ahash
    if (module && typeof module === 'object') {
      if (!module.ahash && (moduleId.includes('weierstrass') || moduleId.includes('noble'))) {
        module.ahash = ahash;
        if (!module.f) module.f = {};
        module.f.ahash = ahash;
      }
    }
    
    return module;
  };
}

// Global patches
if (typeof globalThis !== 'undefined') {
  globalThis.ahash = ahash;
  if (!globalThis.f) globalThis.f = {};
  globalThis.f.ahash = ahash;
}

if (typeof global !== 'undefined') {
  global.ahash = ahash;
  if (!global.f) global.f = {};
  global.f.ahash = ahash;
}

if (typeof window !== 'undefined') {
  window.ahash = ahash;
  if (!window.f) window.f = {};
  window.f.ahash = ahash;
}

// Export for CommonJS
if (typeof exports !== 'undefined') {
  exports.ahash = ahash;
}
