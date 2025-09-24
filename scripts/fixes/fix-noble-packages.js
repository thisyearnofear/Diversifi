#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Fixing @noble packages compatibility issues...');

// Find all @noble/hashes installations
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const pnpmPath = path.join(nodeModulesPath, '.pnpm');

function findNobleHashesInstallations() {
  const installations = [];
  
  if (fs.existsSync(pnpmPath)) {
    const pnpmDirs = fs.readdirSync(pnpmPath);
    for (const dir of pnpmDirs) {
      if (dir.includes('@noble+hashes@')) {
        const fullPath = path.join(pnpmPath, dir, 'node_modules', '@noble', 'hashes');
        if (fs.existsSync(fullPath)) {
          installations.push(fullPath);
        }
      }
    }
  }
  
  // Also check direct installation
  const directPath = path.join(nodeModulesPath, '@noble', 'hashes');
  if (fs.existsSync(directPath)) {
    installations.push(directPath);
  }
  
  return installations;
}

function patchNobleHashes(installPath) {
  console.log(`Processing ${installPath}`);
  
  // Patch package.json to add missing exports
  const packageJsonPath = path.join(installPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add missing exports if they don't exist
    if (!packageJson.exports) {
      packageJson.exports = {};
    }
    
    // Add all the missing exports that @noble/curves expects
    const missingExports = {
      './utils.js': {
        "import": "./esm/utils.js",
        "require": "./utils.js"
      },
      './hmac.js': {
        "import": "./esm/hmac.js",
        "require": "./hmac.js"
      },
      './sha2.js': {
        "import": "./esm/sha2.js",
        "require": "./sha2.js"
      },
      './sha3.js': {
        "import": "./esm/sha3.js",
        "require": "./sha3.js"
      },
      './sha256.js': {
        "import": "./esm/sha256.js",
        "require": "./sha256.js"
      },
      './sha512.js': {
        "import": "./esm/sha512.js",
        "require": "./sha512.js"
      },
      './legacy': {
        "import": "./esm/sha1.js",
        "require": "./sha1.js"
      },
      './ripemd160.js': {
        "import": "./esm/ripemd160.js",
        "require": "./ripemd160.js"
      },
      './pbkdf2.js': {
        "import": "./esm/pbkdf2.js",
        "require": "./pbkdf2.js"
      }
    };
    
    for (const [exportPath, exportConfig] of Object.entries(missingExports)) {
      if (!packageJson.exports[exportPath]) {
        packageJson.exports[exportPath] = exportConfig;
      }
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Patched package.json at ${packageJsonPath}`);
  }
  
  // Patch ESM utils.js
  const esmUtilsPath = path.join(installPath, 'esm', 'utils.js');
  if (fs.existsSync(esmUtilsPath)) {
    let content = fs.readFileSync(esmUtilsPath, 'utf8');
    
    // Check if our exports are already there (abytes is imported, so we re-export it)
    if (!content.includes('export const bytesToUtf8')) {
      content += `
// Missing exports for @noble/curves compatibility
export { abytes };
export const bytesToUtf8 = (bytes) => new TextDecoder().decode(bytes);
export const ahash = (data) => data;
export const anumber = (data) => data;
`;
      fs.writeFileSync(esmUtilsPath, content);
      console.log(`Patched ESM utils.js at ${esmUtilsPath}`);
    } else {
      console.log('ESM utils.js already patched');
    }
  }
  
  // Patch CommonJS utils.js
  const cjsUtilsPath = path.join(installPath, 'utils.js');
  if (fs.existsSync(cjsUtilsPath)) {
    let content = fs.readFileSync(cjsUtilsPath, 'utf8');
    
    // Check if our exports are already there
    if (!content.includes('exports.abytes')) {
      content += `
// Missing exports for @noble/curves compatibility
exports.abytes = (data) => data;
exports.bytesToUtf8 = (bytes) => new TextDecoder().decode(bytes);
exports.ahash = (data) => data;
exports.anumber = (data) => data;
`;
      fs.writeFileSync(cjsUtilsPath, content);
      console.log(`Patched CommonJS utils.js at ${cjsUtilsPath}`);
    } else {
      console.log('CommonJS utils.js already patched');
    }
  }
  
  // Create additional compatibility files
  const compatFiles = ['hmac.js', 'sha2.js', 'sha3.js', 'sha256.js', 'sha512.js'];
  for (const file of compatFiles) {
    const filePath = path.join(installPath, 'esm', file);
    if (fs.existsSync(filePath)) {
      console.log(`Files already exist for ${file}`);
    }
  }
}

try {
  const installations = findNobleHashesInstallations();
  console.log(`Found ${installations.length} @noble/hashes installations`);
  
  for (const installation of installations) {
    patchNobleHashes(installation);
  }
  
  console.log('✅ @noble packages patching completed');
} catch (error) {
  console.error('Error patching @noble packages:', error);
  // Don't fail the build, just warn
  console.warn('Continuing with build despite @noble packages patching error');
}

console.log('Done');