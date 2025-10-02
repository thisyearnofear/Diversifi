// Webpack plugin to fix Noble hashes minified function calls
class NobleHashesFixPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('NobleHashesFixPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'NobleHashesFixPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets) => {
          Object.keys(assets).forEach((assetName) => {
            if (assetName.endsWith('.js')) {
              const asset = assets[assetName];
              let source = asset.source();
              
              if (typeof source === 'string') {
                let modified = false;
                
                // Fix aI is not a function errors
                if (source.includes('aI is not a function') || source.includes('aI(')) {
                  source = source.replace(
                    /\baI\(/g,
                    '(globalThis.aI || require("@noble/hashes/sha3").keccak_256)('
                  );
                  modified = true;
                }
                
                // Fix f.ahash is not a function errors
                if (source.includes('f.ahash')) {
                  source = source.replace(
                    /\(0\s*,\s*f\.ahash\)/g,
                    '(globalThis.f?.ahash || require("@noble/hashes/sha256").sha256)'
                  ).replace(
                    /f\.ahash/g,
                    '(globalThis.f?.ahash || require("@noble/hashes/sha256").sha256)'
                  );
                  modified = true;
                }
                
                // Fix other minified hash function calls
                const hashFunctionPatterns = [
                  { pattern: /\bbI\(/g, replacement: '(globalThis.bI || require("@noble/hashes/sha3").sha3_256)(' },
                  { pattern: /\bcI\(/g, replacement: '(globalThis.cI || require("@noble/hashes/sha256").sha256)(' },
                  { pattern: /\bdI\(/g, replacement: '(globalThis.dI || require("@noble/hashes/sha3").keccak_256)(' },
                ];
                
                hashFunctionPatterns.forEach(({ pattern, replacement }) => {
                  if (pattern.test(source)) {
                    source = source.replace(pattern, replacement);
                    modified = true;
                  }
                });
                
                if (modified) {
                  const { RawSource } = require('webpack').sources;
                  assets[assetName] = new RawSource(source);
                  console.log(`✅ Fixed Noble hashes functions in ${assetName}`);
                }
              }
            }
          });
        }
      );
    });
  }
}

module.exports = NobleHashesFixPlugin;
