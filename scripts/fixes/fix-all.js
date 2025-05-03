#!/usr/bin/env node

/**
 * This script runs all the fix scripts in sequence to address technical debt.
 *
 * Run with: node scripts/fix-all.js
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");

console.log("🔧 Running all fix scripts to address technical debt...\n");

// Function to run a command and handle errors gracefully
function runCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    execSync(command, { stdio: "inherit" });
    console.log(`✅ ${description} completed successfully!\n`);
    return true;
  } catch (error) {
    console.error(
      `\n⚠️ Warning: ${description} encountered an error:`,
      error.message
    );
    console.error(`Continuing with the next step...\n`);
    return false;
  }
}

// Track overall success
let allSuccessful = true;

// 1. Fix viem version issues - manually update package.json files
console.log("📦 Step 1: Fixing viem version issues...");
console.log("Manually updating package.json files...");

try {
  // Update the main package.json
  const mainPackageJsonPath = "./package.json";
  const mainPackageJson = require(mainPackageJsonPath);
  if (mainPackageJson.dependencies?.viem) {
    mainPackageJson.dependencies.viem = "2.23.15";
    fs.writeFileSync(
      mainPackageJsonPath,
      `${JSON.stringify(mainPackageJson, null, 2)}\n`,
      "utf8"
    );
    console.log("✅ Updated viem version in main package.json");
  }

  // Update the contracts package.json
  const contractsPackageJsonPath = "./packages/contracts/package.json";
  if (fs.existsSync(contractsPackageJsonPath)) {
    const contractsPackageJson = require(contractsPackageJsonPath);
    if (contractsPackageJson.dependencies?.viem) {
      contractsPackageJson.dependencies.viem = "2.23.15";
      fs.writeFileSync(
        contractsPackageJsonPath,
        `${JSON.stringify(contractsPackageJson, null, 2)}\n`,
        "utf8"
      );
      console.log("✅ Updated viem version in contracts package.json");
    }
  }

  // Update the frame app package.json
  const framePackageJsonPath =
    "./apps/diversifi-frame/stable-station/package.json";
  if (fs.existsSync(framePackageJsonPath)) {
    const framePackageJson = require(framePackageJsonPath);
    if (framePackageJson.dependencies?.viem) {
      framePackageJson.dependencies.viem = "2.23.15";
      fs.writeFileSync(
        framePackageJsonPath,
        `${JSON.stringify(framePackageJson, null, 2)}\n`,
        "utf8"
      );
      console.log("✅ Updated viem version in frame app package.json");
    }
  }

  // Reinstall dependencies
  console.log("\n📦 Reinstalling dependencies...");
  execSync("pnpm install", { stdio: "inherit" });
  console.log("✅ Dependencies reinstalled successfully!\n");
} catch (error) {
  console.error("\n⚠️ Warning: Error updating viem versions:", error.message);
  console.error("Continuing with the next step...\n");
  allSuccessful = false;
}

// 2. Fix web3-provider.tsx file
if (
  !runCommand(
    "pnpm run fix:web3-provider",
    "Step 2: Fixing web3-provider.tsx file"
  )
) {
  allSuccessful = false;
}

// 3. Fix Tailwind CSS issues
if (
  !runCommand("pnpm run fix:tailwind", "Step 3: Fixing Tailwind CSS issues")
) {
  allSuccessful = false;
}

// 4. Fix Farcaster frame path aliases
if (
  !runCommand(
    "pnpm run fix:frame-paths",
    "Step 4: Fixing Farcaster frame path aliases"
  )
) {
  allSuccessful = false;
}

// 5. Run linting with auto-fix (optional)
if (!runCommand("pnpm run lint:fix", "Step 5: Running linter with auto-fix")) {
  allSuccessful = false;
}

// 6. Try building the project
if (!runCommand("pnpm run build", "Step 6: Building the project")) {
  allSuccessful = false;
}

// Final status
if (allSuccessful) {
  console.log("🎉 All fixes have been applied successfully!");
} else {
  console.log(
    "⚠️ Some fixes were applied, but there were errors along the way."
  );
  console.log(
    "Please check the output above for details on what succeeded and what failed."
  );
}

console.log(
  "📝 See TECHNICAL_DEBT.md for more information on managing technical debt."
);
