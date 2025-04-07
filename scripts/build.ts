import { execSync } from 'child_process';

// Check if we're in a production environment (like Netlify)
const isProduction = process.env.NODE_ENV === 'production' || process.env.NETLIFY === 'true';
const isNetlify = process.env.NETLIFY === 'true';

console.log(`Building in ${isProduction ? 'production' : 'development'} mode`);
console.log(`Building on ${isNetlify ? 'Netlify' : 'local/other'} environment`);

try {
  // Skip migrations on Netlify completely
  if (isNetlify) {
    console.log('Building on Netlify - skipping database migrations');
  }
  // Only run migrations if we're not in production or if POSTGRES_URL is defined and we're not on Netlify
  else if (!isProduction || process.env.POSTGRES_URL) {
    console.log('Running database migrations...');
    execSync('tsx lib/db/migrate', { stdio: 'inherit' });
  } else {
    console.log('Skipping database migrations in production environment');
  }

  // Build the Next.js app
  console.log('Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
