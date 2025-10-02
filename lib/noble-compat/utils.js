// Noble hashes v1.7.1 compatibility shim for utils.js
// Static re-export to avoid webpack critical dependency warnings

try {
  // Direct static require
  const utilsModule = require("@noble/hashes/utils");

  // Create enhanced utf8ToBytes function
  function utf8ToBytes(str) {
    if (utilsModule.utf8ToBytes) {
      return utilsModule.utf8ToBytes(str);
    }
    // Fallback implementation
    return new TextEncoder().encode(str);
  }

  // Create enhanced toBytes function
  function toBytes(data) {
    if (utilsModule.toBytes) {
      return utilsModule.toBytes(data);
    }
    // Fallback implementation
    if (typeof data === 'string') {
      return utf8ToBytes(data);
    }
    if (data instanceof Uint8Array) {
      return data;
    }
    return new Uint8Array(data);
  }

  // Export all utility functions that ethers expects
  module.exports = {
    utf8ToBytes,
    toBytes,
    bytesToHex: utilsModule.bytesToHex || ((bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')),
    hexToBytes: utilsModule.hexToBytes || ((hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))),
    concatBytes: utilsModule.concatBytes || ((...arrays) => {
      const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    }),
    randomBytes: utilsModule.randomBytes || ((length) => crypto.getRandomValues(new Uint8Array(length))),
    wrapConstructor: utilsModule.wrapConstructor,
    wrapConstructorWithOpts: utilsModule.wrapConstructorWithOpts,
    checkOpts: utilsModule.checkOpts,
    Hash: utilsModule.Hash,
    Input: utilsModule.Input,
    // Export everything else as well
    ...utilsModule,
  };
} catch (error) {
  console.error("Failed to load @noble/hashes/utils:", error.message);
  
  // Provide comprehensive fallback implementations
  module.exports = {
    utf8ToBytes: (str) => new TextEncoder().encode(str),
    toBytes: (data) => {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      if (data instanceof Uint8Array) {
        return data;
      }
      return new Uint8Array(data);
    },
    bytesToHex: (bytes) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''),
    hexToBytes: (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))),
    concatBytes: (...arrays) => {
      const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    },
    randomBytes: (length) => crypto.getRandomValues(new Uint8Array(length)),
  };
}
