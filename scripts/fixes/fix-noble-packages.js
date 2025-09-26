#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing @noble packages compatibility issues...");
console.log("Node version:", process.version);
console.log("Working directory:", process.cwd());

// Find all @noble/hashes installations
const nodeModulesPath = path.join(process.cwd(), "node_modules");
const pnpmPath = path.join(nodeModulesPath, ".pnpm");

function findNobleHashesInstallations() {
  const installations = [];

  if (fs.existsSync(pnpmPath)) {
    const pnpmDirs = fs.readdirSync(pnpmPath);
    for (const dir of pnpmDirs) {
      if (dir.includes("@noble+hashes@")) {
        const fullPath = path.join(
          pnpmPath,
          dir,
          "node_modules",
          "@noble",
          "hashes"
        );
        if (fs.existsSync(fullPath)) {
          installations.push(fullPath);
        }
      }
    }
  }

  // Also check direct installation
  const directPath = path.join(nodeModulesPath, "@noble", "hashes");
  if (fs.existsSync(directPath)) {
    installations.push(directPath);
  }

  return installations;
}

function patchNobleHashes(installPath) {
  console.log(`Processing ${installPath}`);

  // Patch package.json to add missing exports
  const packageJsonPath = path.join(installPath, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Add missing exports if they don't exist
    if (!packageJson.exports) {
      packageJson.exports = {};
    }

    // Add all the missing exports that @noble/curves expects
    const missingExports = {
      "./utils.js": {
        import: "./esm/utils.js",
        require: "./utils.js",
      },
      "./hmac.js": {
        import: "./esm/hmac.js",
        require: "./hmac.js",
      },
      "./sha2.js": {
        import: "./esm/sha2.js",
        require: "./sha2.js",
      },
      "./sha3.js": {
        import: "./esm/sha3.js",
        require: "./sha3.js",
      },
      "./sha256.js": {
        import: "./esm/sha256.js",
        require: "./sha256.js",
      },
      "./sha512.js": {
        import: "./esm/sha512.js",
        require: "./sha512.js",
      },
      "./legacy": {
        import: "./legacy.js",
        require: "./legacy.js",
      },
      "./ripemd160.js": {
        import: "./esm/ripemd160.js",
        require: "./ripemd160.js",
      },
      "./pbkdf2.js": {
        import: "./esm/pbkdf2.js",
        require: "./pbkdf2.js",
      },
    };

    for (const [exportPath, exportConfig] of Object.entries(missingExports)) {
      if (!packageJson.exports[exportPath] || exportPath === "./legacy") {
        packageJson.exports[exportPath] = exportConfig;
      }
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Patched package.json at ${packageJsonPath}`);
  }

  // Patch ESM utils.js
  const esmUtilsPath = path.join(installPath, "esm", "utils.js");
  if (fs.existsSync(esmUtilsPath)) {
    let esmContent = fs.readFileSync(esmUtilsPath, "utf8");

    // Remove any existing patches first
    esmContent = esmContent.replace(
      /\/\/ Missing exports for @noble\/curves compatibility[\s\S]*?(?=\/\/# sourceMappingURL)/g,
      ""
    );

    if (!esmContent.includes("export { abytes, anumber }")) {
      esmContent = esmContent.replace(
        "//# sourceMappingURL=utils.js.map",
        `// Missing exports for @noble/curves compatibility
export { abytes, anumber } from './_assert.js';
export const bytesToUtf8 = (bytes) => new TextDecoder().decode(bytes);
export { ahash } from './_assert.js';
//# sourceMappingURL=utils.js.map`
      );
      fs.writeFileSync(esmUtilsPath, esmContent);
      console.log(`ESM utils.js patched at ${esmUtilsPath}`);
    } else {
      console.log("ESM utils.js already patched");
    }
  }

  // Patch CommonJS utils.js
  const cjsUtilsPath = path.join(installPath, "utils.js");
  if (fs.existsSync(cjsUtilsPath)) {
    let cjsContent = fs.readFileSync(cjsUtilsPath, "utf8");

    // Remove any existing patches first
    cjsContent = cjsContent.replace(
      /\/\/ Missing exports for @noble\/curves compatibility[\s\S]*?(?=\/\/# sourceMappingURL)/g,
      ""
    );

    if (!cjsContent.includes("exports.abytes = abytes")) {
      cjsContent = cjsContent.replace(
        "//# sourceMappingURL=utils.js.map",
        `// Missing exports for @noble/curves compatibility
const { abytes, anumber, ahash } = require('./_assert.js');
exports.abytes = abytes; exports.anumber = anumber; exports.ahash = ahash;
exports.bytesToUtf8 = (bytes) => new TextDecoder().decode(bytes);
//# sourceMappingURL=utils.js.map`
      );
      fs.writeFileSync(cjsUtilsPath, cjsContent);
      console.log(`CommonJS utils.js patched at ${cjsUtilsPath}`);
    } else {
      console.log("CommonJS utils.js already patched");
    }
  }

  // Create legacy.js file for ripemd160 compatibility
  const legacyPath = path.join(installPath, "legacy.js");
  if (!fs.existsSync(legacyPath)) {
    const legacyContent = `export { ripemd160 } from './esm/ripemd160.js';`;
    fs.writeFileSync(legacyPath, legacyContent);
    console.log(`Created legacy.js at ${legacyPath}`);
  } else {
    console.log("legacy.js already exists");
  }

  // Create additional compatibility files if they don't exist
  const compatFiles = [
    { name: "hmac.js", content: `export * from './esm/hmac.js';` },
    { name: "sha2.js", content: `export * from './esm/sha2.js';` },
    { name: "sha3.js", content: `export * from './esm/sha3.js';` },
    { name: "sha256.js", content: `export * from './esm/sha256.js';` },
    { name: "sha512.js", content: `export * from './esm/sha512.js';` },
  ];

  for (const file of compatFiles) {
    const filePath = path.join(installPath, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content);
      console.log(`Created ${file.name} at ${filePath}`);
    }
  }
}

try {
  const installations = findNobleHashesInstallations();
  console.log(`Found ${installations.length} @noble/hashes installations`);

  for (const installation of installations) {
    patchNobleHashes(installation);
  }

  console.log("✅ @noble packages patching completed");

  // Verify patches are working
  console.log("🔍 Verifying patches...");
  try {
    const utilsPath = path.join(
      process.cwd(),
      "node_modules/@noble/hashes/esm/utils.js"
    );
    if (fs.existsSync(utilsPath)) {
      const content = fs.readFileSync(utilsPath, "utf8");
      if (content.includes("export { abytes, anumber }")) {
        console.log("✅ ESM utils.js patch verified");
      } else {
        console.log("❌ ESM utils.js patch NOT found");
      }
    }
  } catch (error) {
    console.log("⚠️ Verification error:", error.message);
  }
} catch (error) {
  console.error("Error patching @noble packages:", error);
  // Don't fail the build, just warn
  console.warn("Continuing with build despite @noble packages patching error");
}

console.log("Done");
