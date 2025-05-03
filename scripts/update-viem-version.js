#!/usr/bin/env node

/**
 * This script updates the viem version in the pnpm-lock.yaml file
 * to ensure all dependencies use the same version of viem.
 *
 * Run with: node scripts/update-viem-version.js
 */

const fs = require("node:fs");
const path = require("node:path");

// Define the target viem version
const TARGET_VIEM_VERSION = "2.23.15";

// Function to run the pnpm command to update viem
function updateViem() {
  console.log(`\n🔄 Updating viem to version ${TARGET_VIEM_VERSION}...\n`);

  try {
    // First, update the main package
    console.log("1. Updating viem in the main package...");
    const { execSync } = require("node:child_process");
    execSync(`pnpm add viem@${TARGET_VIEM_VERSION} --save-exact -w`, {
      stdio: "inherit",
    });

    // Then update in the workspace packages
    console.log("\n2. Updating viem in workspace packages...");
    execSync(
      `pnpm --filter="@diversifi/contracts" add viem@${TARGET_VIEM_VERSION} --save-exact`,
      { stdio: "inherit" }
    );
    execSync(
      `pnpm --filter="stable-station" add viem@${TARGET_VIEM_VERSION} --save-exact`,
      { stdio: "inherit" }
    );

    console.log("\n✅ Successfully updated viem version across all packages!");
    console.log(
      "\n🧹 Cleaning up node_modules to ensure clean installation..."
    );

    // Optional: clean up node_modules to ensure clean installation
    execSync("rm -rf node_modules", { stdio: "inherit" });
    execSync("pnpm install --frozen-lockfile", { stdio: "inherit" });

    console.log("\n🎉 All done! Try building your project now.");
  } catch (error) {
    console.error("\n❌ Error updating viem version:", error.message);
    process.exit(1);
  }
}

// Run the update
updateViem();
