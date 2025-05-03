#!/usr/bin/env node

/**
 * This script fixes path alias issues in the Farcaster frame app.
 * It replaces '~/lib/utils' imports with relative paths.
 * 
 * Run with: node scripts/fix-frame-path-aliases.js
 */

const fs = require('node:fs');
const path = require('node:path');

// Base directory for the Farcaster frame app
const FRAME_APP_DIR = path.join(
  process.cwd(),
  'apps',
  'diversifi-frame',
  'stable-station'
);

// Function to find all files with path alias issues
function findFilesWithPathAliases(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.next')) {
      fileList = findFilesWithPathAliases(filePath, fileList);
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('~/lib/utils') || content.includes('~/lib/kv')) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Function to fix path aliases in a file
function fixPathAliases(filePath) {
  console.log(`Fixing path aliases in: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create the utils.ts file if it doesn't exist
    const utilsDir = path.join(FRAME_APP_DIR, 'src', 'lib');
    const utilsPath = path.join(utilsDir, 'utils.ts');
    
    if (!fs.existsSync(utilsDir)) {
      fs.mkdirSync(utilsDir, { recursive: true });
      console.log(`Created directory: ${utilsDir}`);
    }
    
    if (!fs.existsSync(utilsPath)) {
      const utilsContent = `
/**
 * Utility functions for the Farcaster frame app
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
      fs.writeFileSync(utilsPath, utilsContent, 'utf8');
      console.log(`Created utils.ts file: ${utilsPath}`);
    }
    
    // Calculate the relative path from the file to the utils.ts file
    const fileDir = path.dirname(filePath);
    const relativePathToUtils = path.relative(fileDir, utilsDir).replace(/\\/g, '/');
    const importPath = relativePathToUtils ? `${relativePathToUtils}/utils` : './utils';
    
    // Replace the path aliases
    content = content.replace(/from ['"]~\/lib\/utils['"]/g, `from '${importPath}'`);
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed path aliases in: ${filePath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error fixing path aliases in ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log(`\n🔧 Fixing path alias issues in the Farcaster frame app...\n`);
  
  // Find all files with path alias issues
  const files = findFilesWithPathAliases(FRAME_APP_DIR);
  
  if (files.length === 0) {
    console.log('No files with path alias issues found.');
    return;
  }
  
  console.log(`Found ${files.length} files with path alias issues.`);
  
  // Fix path aliases in each file
  let successCount = 0;
  let failCount = 0;
  
  files.forEach(file => {
    const success = fixPathAliases(file);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  });
  
  console.log(`\n✅ Fixed path aliases in ${successCount} files.`);
  if (failCount > 0) {
    console.log(`❌ Failed to fix path aliases in ${failCount} files.`);
  }
}

// Run the main function
main();
