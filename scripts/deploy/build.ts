import { execSync } from 'node:child_process';

// Build the root Next.js app (Stables Station)
// Note: migrations run separately via 'pnpm db:migrate' in production

console.log('🏗️  Building Stables Station (root app)...');

try {
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// NOTE: apps/diversifi is a separate MiniPay app that should:
// - Have its own repository OR
// - Have its own Vercel/Netlify deployment
// - NOT be built as part of this monorepo's main deployment
