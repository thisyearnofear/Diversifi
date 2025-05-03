#!/usr/bin/env node

/**
 * This script fixes common Tailwind CSS class issues:
 * 1. Replaces width/height pairs with size shorthand (e.g., 'w-5 h-5' -> 'size-5')
 * 2. Updates deprecated class names (e.g., 'flex-shrink-0' -> 'shrink-0')
 *
 * Run with: node scripts/fix-tailwind-classes.js
 */

const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

// Define the patterns to search for and their replacements
const PATTERNS = [
  // Size shorthand replacements
  {
    regex: /\b(w-\d+)\s+(h-\d+)\b/g,
    replacement: (match, w, h) => {
      // Only replace if the numbers match
      const wNum = w.replace("w-", "");
      const hNum = h.replace("h-", "");
      return wNum === hNum ? `size-${wNum}` : match;
    },
    description: "Replace width/height pairs with size shorthand",
  },
  {
    regex: /\b(h-\d+)\s+(w-\d+)\b/g,
    replacement: (match, h, w) => {
      // Only replace if the numbers match
      const hNum = h.replace("h-", "");
      const wNum = w.replace("w-", "");
      return hNum === wNum ? `size-${hNum}` : match;
    },
    description: "Replace height/width pairs with size shorthand",
  },
  // Deprecated class replacements
  {
    regex: /\bflex-shrink-0\b/g,
    replacement: "shrink-0",
    description: "Replace flex-shrink-0 with shrink-0",
  },
  // Full/full replacements
  {
    regex: /\b(w-full)\s+(h-full)\b/g,
    replacement: "size-full",
    description: "Replace w-full h-full with size-full",
  },
  {
    regex: /\b(h-full)\s+(w-full)\b/g,
    replacement: "size-full",
    description: "Replace h-full w-full with size-full",
  },
];

// Function to process a file
function processFile(filePath) {
  try {
    // Skip if not a TypeScript/JavaScript/JSX/TSX file
    if (![".js", ".jsx", ".ts", ".tsx"].includes(path.extname(filePath))) {
      return { filePath, skipped: true };
    }

    // Read the file content
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    const changes = [];

    // Apply each pattern
    PATTERNS.forEach((pattern) => {
      const matches = content.match(pattern.regex);
      if (matches) {
        content = content.replace(pattern.regex, pattern.replacement);
        changes.push({
          pattern: pattern.description,
          count: matches.length,
        });
      }
    });

    // If changes were made, write the file
    if (originalContent !== content) {
      fs.writeFileSync(filePath, content, "utf8");
      return {
        filePath,
        changed: true,
        changes,
      };
    }

    return { filePath, changed: false };
  } catch (error) {
    return {
      filePath,
      error: error.message,
    };
  }
}

// Function to find all TypeScript/JavaScript files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !filePath.includes("node_modules") &&
      !filePath.includes(".next")
    ) {
      fileList = findFiles(filePath, fileList);
    } else if ([".js", ".jsx", ".ts", ".tsx"].includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main function
function main() {
  console.log("🔍 Finding files to process...");

  // Find all component files
  const componentDirs = [
    path.join(process.cwd(), "components"),
    path.join(process.cwd(), "app"),
  ];

  let allFiles = [];
  componentDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(findFiles(dir));
    }
  });

  console.log(`Found ${allFiles.length} files to process.`);

  // Process each file
  const results = allFiles.map(processFile);

  // Summarize results
  const changed = results.filter((r) => r.changed);
  const errors = results.filter((r) => r.error);

  console.log(`\n✅ Processed ${allFiles.length} files:`);
  console.log(`  - ${changed.length} files updated`);
  console.log(`  - ${errors.length} files had errors`);

  if (changed.length > 0) {
    console.log("\nFiles updated:");
    changed.forEach((result) => {
      console.log(`  - ${result.filePath}`);
      result.changes.forEach((change) => {
        console.log(`    - ${change.pattern}: ${change.count} occurrences`);
      });
    });
  }

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((result) => {
      console.log(`  - ${result.filePath}: ${result.error}`);
    });
  }

  // Skip formatting for now as it might cause issues with seed files
  if (changed.length > 0) {
    console.log(
      "\n🧹 Skipping automatic formatting to avoid issues with seed files."
    );
    console.log("   You can manually run formatting later with: pnpm format");
  }
}

// Run the main function
main();
