#!/usr/bin/env node

/**
 * Style Migration Helper
 * 
 * This script helps with migrating components to the new styling system.
 * It scans files for common styling patterns and suggests replacements.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENTS_DIR = path.join(process.cwd(), 'components');
const APP_DIR = path.join(process.cwd(), 'app');
const IGNORE_DIRS = ['node_modules', '.next', 'public', 'styles'];
const IGNORE_FILES = ['.DS_Store', '.gitignore'];

// Color patterns to look for
const COLOR_PATTERNS = [
  // Background colors
  /bg-(red|blue|green|yellow|purple|amber|indigo|gray|zinc)-(50|100|200|800|900|950)(\/\d+)?/g,
  // Text colors
  /text-(red|blue|green|yellow|purple|amber|indigo|gray|zinc)-(400|500|600|700)/g,
  // Border colors
  /border-(red|blue|green|yellow|purple|amber|indigo|gray|zinc)-(200|300|400|500|600|700|800)/g,
  // Hover states
  /hover:bg-(red|blue|green|yellow|purple|amber|indigo|gray|zinc)-(100|200|700|800|900)/g,
];

// Region mappings
const REGION_COLORS = {
  'red': 'USA',
  'blue': 'Europe',
  'green': 'Africa',
  'yellow': 'LatAm',
  'purple': 'Asia',
  'amber': 'RWA',
};

// Chain mappings
const CHAIN_COLORS = {
  'blue': 'BASE',
  'purple': 'OPTIMISM',
  'yellow': 'CELO',
  'indigo': 'POLYGON',
};

// Scan a file for color patterns
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileExt = path.extname(filePath);
    
    // Only scan TypeScript/JavaScript/JSX/TSX files
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(fileExt)) {
      return null;
    }
    
    // Check if the file already imports our style utilities
    const hasStyleImports = content.includes('getRegionStyle') || 
                           content.includes('getChainStyle') || 
                           content.includes('from "@/lib/styles/style-utils"');
    
    let matches = [];
    let lineMatches = {};
    
    // Split content into lines for better reporting
    const lines = content.split('\n');
    
    // Check each line for color patterns
    lines.forEach((line, index) => {
      for (const pattern of COLOR_PATTERNS) {
        const lineMatches = [...line.matchAll(pattern)];
        if (lineMatches.length > 0) {
          lineMatches.forEach(match => {
            const [fullMatch, color, shade] = match;
            matches.push({
              line: index + 1,
              text: line.trim(),
              match: fullMatch,
              color,
              shade,
              region: REGION_COLORS[color],
              chain: CHAIN_COLORS[color],
            });
          });
        }
      }
    });
    
    if (matches.length > 0) {
      return {
        path: filePath,
        matches,
        hasStyleImports,
        totalMatches: matches.length,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
    return null;
  }
}

// Scan a directory recursively
function scanDirectory(dir) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    if (IGNORE_FILES.includes(item)) continue;
    
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      if (IGNORE_DIRS.includes(item)) continue;
      results = results.concat(scanDirectory(itemPath));
    } else {
      const result = scanFile(itemPath);
      if (result) {
        results.push(result);
      }
    }
  }
  
  return results;
}

// Generate suggestions for migration
function generateSuggestions(result) {
  const suggestions = [];
  
  if (!result.hasStyleImports) {
    suggestions.push(`Import style utilities:
import { getRegionStyle, getChainStyle, getSidebarMenuButtonStyle } from "@/lib/styles/style-utils";
import { cn } from "@/lib/utils";`);
  }
  
  // Group matches by line to avoid duplicate suggestions
  const lineGroups = {};
  result.matches.forEach(match => {
    if (!lineGroups[match.line]) {
      lineGroups[match.line] = [];
    }
    lineGroups[match.line].push(match);
  });
  
  // Generate suggestions for each line
  Object.entries(lineGroups).forEach(([line, matches]) => {
    const lineText = matches[0].text;
    
    // Check if this looks like a className prop
    if (lineText.includes('className=')) {
      suggestions.push(`Line ${line}: Consider replacing hardcoded colors with style utilities:
Original: ${lineText}
Suggestion: ${generateClassNameSuggestion(lineText, matches)}`);
    }
    // Check if this looks like a cn() call
    else if (lineText.includes('cn(')) {
      suggestions.push(`Line ${line}: Consider replacing hardcoded colors in cn() with style utilities:
Original: ${lineText}
Suggestion: ${generateCnSuggestion(lineText, matches)}`);
    }
  });
  
  return suggestions;
}

// Generate suggestion for className prop
function generateClassNameSuggestion(lineText, matches) {
  let suggestion = lineText;
  
  // Check if we have region or chain colors
  const hasRegionColor = matches.some(m => m.region);
  const hasChainColor = matches.some(m => m.chain);
  
  if (hasRegionColor) {
    const region = matches.find(m => m.region)?.region || 'default';
    suggestion = suggestion.replace(/className="([^"]*)"/, 'className={getRegionStyle("' + region + '", "medium", "bg")}');
  } else if (hasChainColor) {
    const chain = matches.find(m => m.chain)?.chain || 'BASE';
    suggestion = suggestion.replace(/className="([^"]*)"/, 'className={getChainStyle("' + chain + '", "medium", "bg")}');
  }
  
  return suggestion;
}

// Generate suggestion for cn() call
function generateCnSuggestion(lineText, matches) {
  let suggestion = lineText;
  
  // Check if we have region or chain colors
  const hasRegionColor = matches.some(m => m.region);
  const hasChainColor = matches.some(m => m.chain);
  
  if (hasRegionColor) {
    const region = matches.find(m => m.region)?.region || 'default';
    suggestion = suggestion.replace(/cn\(([^)]*)\)/, 'cn($1, getRegionStyle("' + region + '", "medium", "bg"))');
  } else if (hasChainColor) {
    const chain = matches.find(m => m.chain)?.chain || 'BASE';
    suggestion = suggestion.replace(/cn\(([^)]*)\)/, 'cn($1, getChainStyle("' + chain + '", "medium", "bg"))');
  }
  
  return suggestion;
}

// Main function
function main() {
  console.log('Scanning for components that need style migration...');
  
  // Scan components directory
  const componentsResults = scanDirectory(COMPONENTS_DIR);
  
  // Scan app directory
  const appResults = scanDirectory(APP_DIR);
  
  // Combine results and sort by number of matches
  const allResults = [...componentsResults, ...appResults]
    .sort((a, b) => b.totalMatches - a.totalMatches);
  
  console.log(`\nFound ${allResults.length} files with hardcoded color classes.`);
  
  // Display top 10 files with the most matches
  console.log('\nTop files to migrate:');
  allResults.slice(0, 10).forEach((result, index) => {
    console.log(`${index + 1}. ${result.path} (${result.totalMatches} matches)`);
    
    // Generate and display suggestions for the top files
    if (index < 3) {
      const suggestions = generateSuggestions(result);
      suggestions.slice(0, 3).forEach(suggestion => {
        console.log(`   - ${suggestion.split('\n')[0]}`);
      });
      console.log('');
    }
  });
  
  console.log('\nTo migrate a specific file, run:');
  console.log('node scripts/style-migration-helper.js <file-path>');
}

// If a specific file is provided, analyze just that file
if (process.argv.length > 2) {
  const filePath = process.argv[2];
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    const result = scanFile(fullPath);
    
    if (result) {
      console.log(`\nAnalyzing ${filePath}:`);
      console.log(`Found ${result.totalMatches} hardcoded color classes.`);
      
      const suggestions = generateSuggestions(result);
      console.log('\nSuggestions:');
      suggestions.forEach(suggestion => {
        console.log(suggestion);
        console.log('');
      });
    } else {
      console.log(`No hardcoded color classes found in ${filePath}.`);
    }
  } else {
    console.error(`File not found: ${filePath}`);
  }
} else {
  // Run the main function to scan all files
  main();
}
