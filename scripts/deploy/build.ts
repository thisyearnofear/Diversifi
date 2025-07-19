import { execSync } from 'node:child_process';
import fs from 'node:fs';

// Check if we're in a production environment (like Netlify)
const isProduction =
  process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';
const isNetlify = process.env.NETLIFY === 'true';

console.log(`Building in ${isProduction ? 'production' : 'development'} mode`);
console.log(`Building on ${isNetlify ? 'Netlify' : 'local/other'} environment`);

try {
  // Ensure required dependencies are installed
  if (isNetlify) {
    console.log('Installing required dependencies for Netlify build...');
    execSync('pnpm add -D -w stream-browserify buffer crypto-browserify util', { stdio: 'inherit' });
  }

  // Run migrations if database URL is available and not on Netlify
  if (!isNetlify && process.env.POSTGRES_URL) {
    console.log('Running database migrations...');
    execSync('tsx lib/db/migrate', { stdio: 'inherit' });
  } else {
    console.log('Skipping database migrations (no POSTGRES_URL or building on Netlify)');
  }

  console.log('Building applications...');
  
  // Build the main Next.js app
  console.log('Building main Next.js application...');
  execSync('next build', { stdio: 'inherit' });

  // Build the DiversiFi app
  console.log('Building DiversiFi application...');
  execSync('pnpm --filter diversifi build', { stdio: 'inherit' });
  // If we're on Netlify, make sure the output is in the correct location
  if (isNetlify) {
    console.log('Preparing build output for Netlify...');
    // Ensure the .next directory exists
    execSync('mkdir -p .next', { stdio: 'inherit' });

    // If the main app build succeeded, copy its output to the root .next directory
    if (process.env.NETLIFY_NEXT_PLUGIN_SKIP === 'true') {
      console.log('Skipping Next.js plugin - using standalone output');
    } else {
      console.log('Setting up build output for Netlify Next.js plugin');

      // Copy necessary files for the Netlify Next.js plugin
      try {
        // Copy standalone files if they exist
        execSync('cp -r .next/standalone/* .next/ 2>/dev/null || true', { stdio: 'inherit' });
        execSync('cp -r .next/static .next/standalone/ 2>/dev/null || true', { stdio: 'inherit' });

        // Create a simple index.html file to help Netlify detect the build
        const indexHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Stables Station</title>
  <meta http-equiv="refresh" content="0;url=/diversifi">
</head>
<body>
  <p>Redirecting to <a href="/diversifi">DiversiFi</a>...</p>
</body>
</html>`;

        // Write the index.html file to the .next directory
        fs.writeFileSync('.next/index.html', indexHtml);

        console.log('Created index.html for Netlify');
      } catch (error) {
        console.warn('Error setting up Netlify build output:', error);
      }
    }
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
