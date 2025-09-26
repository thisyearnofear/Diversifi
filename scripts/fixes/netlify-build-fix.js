#!/usr/bin/env node

/**
 * Netlify build fix script
 * This script ensures that all dependencies are properly configured for Netlify builds
 */

const fs = require("fs");
const path = require("path");

console.log("🔧 Netlify build fix script running...");

// Function to ensure pnpm configuration is correct
function fixPnpmConfig() {
  try {
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Ensure packageManager field exists
    if (!packageJson.packageManager) {
      const pnpmVersion = process.env.PNPM_VERSION || "10.17.1";
      packageJson.packageManager = `pnpm@${pnpmVersion}`;
      fs.writeFileSync(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2) + "\n"
      );
      console.log("✅ Added packageManager field to package.json");
    } else {
      console.log("✅ packageManager field already exists");
    }

    return true;
  } catch (error) {
    console.error("❌ Error fixing pnpm config:", error.message);
    return false;
  }
}

// Function to verify noble packages patch
function verifyNoblePackages() {
  try {
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    const noblePath = path.join(nodeModulesPath, "@noble", "hashes");

    if (!fs.existsSync(noblePath)) {
      console.log(
        "⚠️ @noble/hashes not found in node_modules, will be installed during build"
      );
      return true;
    }

    // Check if the patch was applied
    const esmUtilsPath = path.join(noblePath, "esm", "utils.js");
    if (fs.existsSync(esmUtilsPath)) {
      const content = fs.readFileSync(esmUtilsPath, "utf8");
      if (content.includes("export { abytes, anumber }")) {
        console.log("✅ @noble/hashes patch verified");
        return true;
      } else {
        console.log(
          "⚠️ @noble/hashes patch not found, will be applied during build"
        );
        return true; // Not fatal, will be fixed during build
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error verifying noble packages:", error.message);
    return false;
  }
}

// Function to fix lockfile issues
function fixLockfile() {
  try {
    const lockfilePath = path.join(process.cwd(), "pnpm-lock.yaml");
    if (fs.existsSync(lockfilePath)) {
      // In Netlify environment, we should rely on the lockfile but allow updates
      console.log("✅ pnpm-lock.yaml found");
      return true;
    } else {
      console.log(
        "⚠️ pnpm-lock.yaml not found, will be generated during install"
      );
      return true;
    }
  } catch (error) {
    console.error("❌ Error checking lockfile:", error.message);
    return false;
  }
}

// Main function
function main() {
  console.log("🔧 Running Netlify build fixes...");

  const fixes = [fixPnpmConfig(), verifyNoblePackages(), fixLockfile()];

  const allSuccess = fixes.every((success) => success);

  if (allSuccess) {
    console.log("✅ All Netlify build fixes completed successfully");
    process.exit(0);
  } else {
    console.log("❌ Some Netlify build fixes failed");
    process.exit(1);
  }
}

// Run the script
main();
