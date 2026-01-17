# Architecture Guide

## Project Structure

### Packages (Monorepo)

#### `@diversifi/types`
Shared type definitions. No business logic, no dependencies on implementation.
- `/api` - API request/response types
- `/blockchain` - Web3, wallet, token types
- `/domain` - User, products, rewards, voting
- `/ui` - UI component prop types

**Import:** `import type { User, Token } from '@diversifi/types'`

#### `@diversifi/config`
Build config, linting, environment validation.
- Provides ESLint presets
- TypeScript configs
- Environment variable schema

**Import:** `import { env } from '@diversifi/config'`

#### `@diversifi/shared`
Reusable, lightweight utilities. All dependencies externalized.

**Entry points:**
- `@diversifi/shared` - constants, utilities (lightweight)
- `@diversifi/shared/web3` - wallet, swap, blockchain hooks
- `@diversifi/shared/ui` - React components
- `@diversifi/shared/constants` - just constants

### App Directory Structure

```
app/
├── providers/           # All providers composed in root-provider.tsx
│   ├── root-provider.tsx        # Single composition point (use this)
│   ├── auth-provider.tsx        # Auth context
│   ├── web3-provider.tsx        # Wagmi + wallet
│   └── (deprecated: old providers)
├── api/                 # API routes (see below)
├── (routes)/            # Page routes
├── actions/             # Server actions
├── hooks/               # App-specific hooks (reusable ones go to @diversifi/shared)
├── layout.tsx           # Root layout using RootProvider
└── globals.css
```

### API Routes Organization

Currently being reorganized from flat structure to feature-based:

```
app/api/
├── auth/
│   ├── siwe/
│   │   ├── challenge/route.ts
│   │   └── verify/route.ts
├── chat/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── enforce-limit/route.ts
├── commerce/
│   └── verify/[productId]/[chargeId]/route.ts
├── rewards/
│   ├── user/route.ts
│   └── claim/route.ts
├── web3/
│   ├── wallet/
│   │   ├── balance/route.ts
│   │   ├── create/route.ts
│   │   └── fund/route.ts
│   └── actions/
│       └── [action]/route.ts
├── actions/             # Legacy - should migrate to web3/actions
└── vote/
    └── route.ts
```

## Code Patterns

### Server vs Client Code

- **Server:** API routes (`app/api/**`), server actions, database queries
- **Client:** Components with 'use client', hooks, UI state

Always mark client components explicitly:
```tsx
'use client';
import { useState } from 'react';
```

### Importing Dependencies

**For types:** Use @diversifi/types
```tsx
import type { User, Token } from '@diversifi/types';
```

**For lightweight utilities:** Use @diversifi/shared
```tsx
import { REGIONS } from '@diversifi/shared/constants';
```

**For Web3 logic:** Use specific entry point
```tsx
import { useWalletBase } from '@diversifi/shared/web3';
```

**For environment variables:** Use @diversifi/config
```tsx
import { env } from '@diversifi/config';
const apiKey = env.OPENAI_API_KEY;
```

## Build & Performance

### Key Principles

1. **No Double Bundling:** @diversifi/shared externalizes all dependencies
2. **Granular Entry Points:** Only import what you need
3. **Lazy Loading:** Heavy providers (Web3) are lazy-loaded
4. **Server/Client Boundaries:** Clear separation prevents unnecessary client code

### Tree-Shaking

- Only unused exports from @diversifi/shared will be tree-shaken
- Use granular entry points: `@diversifi/shared/constants` not `@diversifi/shared`
- Mark side-effects in package.json

## Environment Variables

See `.env.example` for all variables. Runtime validation in `@diversifi/config/env.ts`.

```tsx
import { env } from '@diversifi/config';

// Throws at build time if missing
const apiKey = env.OPENAI_API_KEY;

// Safe for client (NEXT_PUBLIC_ prefix)
const chainId = env.NEXT_PUBLIC_ACTIVE_CHAIN;
```

## Naming Conventions

- Server actions: `*.server.ts` or use 'use server'
- Client components: `*.tsx` with 'use client'
- Hooks: `use*.ts`
- Types: `*.ts` in types package or `*.types.ts`
- Styles: module.css or with Tailwind classes

## Adding New Features

1. **Create types** in `@diversifi/types`
2. **Create API route** in `app/api/{feature}/`
3. **Create components/hooks** in `app/` or `@diversifi/shared`
4. **Create page** in `app/(routes)/`
5. **Use RootProvider** for any new providers (don't nest providers)

---

## Architecture Migration Checklist

### Phase 1: Foundation ✅ DONE

- [x] Create `@diversifi/types` package with domain types
- [x] Create environment validation in `@diversifi/config`
- [x] Split `@diversifi/shared` into granular entry points
- [x] Create `RootProvider` for unified provider composition
- [x] Update `app/layout.tsx` to use `RootProvider`
- [x] Document architecture in `ARCHITECTURE.md`

### Phase 2: API Route Organization (NEXT)

**Status:** API routes are flat, need to reorganize by feature

### Structure
```
app/api/
├── auth/
│   └── siwe/
│       ├── challenge/route.ts
│       └── verify/route.ts
├── chat/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── enforce-limit/route.ts
├── commerce/
│   └── verify/
│       └── [productId]/[chargeId]/route.ts
├── rewards/
│   ├── user/route.ts
│   └── claim/route.ts
├── wallet/
│   ├── balance/route.ts
│   ├── create/route.ts
│   └── fund/route.ts
├── starter-kit/
│   ├── available/route.ts
│   ├── claim/[kitId]/route.ts
│   ├── created/list/route.ts
│   ├── claimed/list/route.ts
│   ├── give/[kitId]/[recipientId]/route.ts
│   └── request/route.ts
├── voting/
│   └── route.ts
└── web3/
    └── (blockchain-specific routes)
```

### Files to Move
- `/app/api/auth/siwe/**` → Already organized ✅
- `/app/api/chat/**` → Already organized ✅
- `/app/api/commerce/**` → Already organized ✅
- `/app/api/rewards/**` → Already organized ✅
- `/app/api/wallet/**` → Need to consolidate:
  - `wallet/balance/route.ts`
  - `wallet/create/route.ts`
  - `wallet/fund/route.ts`
- `/app/api/starter-kit/**` → Need to organize
- `/app/api/vote/route.ts` → Move to `/voting/route.ts`
- `/app/api/actions/**` → Complex, needs analysis

### Phase 3: Server/Client Code Splitting (PENDING)

**Status:** Need to identify all server actions and mark boundaries

### Goals
- [ ] Mark all server actions with `'use server'`
- [ ] Create `*.server.ts` files for server-only utilities
- [ ] Use `import 'server-only'` in server modules
- [ ] Remove server code from client components

### Example Server Module
```tsx
// app/lib/user.server.ts
import 'server-only';
import { db } from '@/lib/db';

export async function getUserProfile(userId: string) {
  return db.users.findUnique({ where: { id: userId } });
}
```

### Phase 4: Hook Consolidation (PENDING)

**Status:** Hooks spread across `app/hooks/` and `packages/shared/hooks/`

### Goals
- [ ] Move reusable hooks to `@diversifi/shared/web3` or `@diversifi/shared/hooks`
- [ ] Keep app-specific hooks in `app/hooks/`

### Hooks to Evaluate
- `app/hooks/use-transaction.ts` - reusable? Move to shared
- `app/hooks/use-wallet.ts` - reusable? Move to shared
- Custom hooks in components - refactor to `app/hooks/`

### Phase 5: Build Optimization (PENDING)

### Goals
- [ ] Verify `next.config.ts` no longer needs crypto polyfills
- [ ] Test build with `pnpm build`
- [ ] Analyze bundle with `next/bundle-analyzer`
- [ ] Set up dynamic imports for large routes
- [ ] Verify tree-shaking works for @diversifi/shared

### Next Config Cleanup
- [x] Remove crypto-browserify workarounds
- [x] Remove buffer/stream-browserify fallbacks
- [ ] Test build completes without errors

### Phase 6: Type Safety Improvements (PENDING)

### Goals
- [ ] Use `@diversifi/types` instead of inline interfaces
- [ ] Replace `any` types with proper types
- [ ] Enable strict TypeScript mode
- [ ] Document API request/response types in `@diversifi/types/api.ts`

### Example
**Before:**
```tsx
const response: any = await fetch('/api/chat', { /* ... */ });
```

**After:**
```tsx
import type { Message } from '@diversifi/types';
const response = await fetch('/api/chat', { /* ... */ });
const data: Message[] = await response.json();
```

### Phase 7: Provider Cleanup (PENDING)

### Status
- [x] Created `RootProvider` to unify provider composition
- [ ] Remove old provider wrapper files (after verifying nothing imports them)
- [ ] Delete `/lib/web3/providers.tsx`
- [ ] Delete or deprecate `/app/providers/` individual files

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Build fails | Run `pnpm install && pnpm build` incrementally |
| Import paths break | Search for old imports, update systematically |
| Circular dependencies | Use `@diversifi/types` as foundation |
| Performance regression | Bundle analyze before/after |

### Testing Checklist

- [ ] `pnpm install` completes
- [ ] `pnpm build:packages` builds @diversifi/types and @diversifi/shared
- [ ] `pnpm build` (Next.js) completes without warnings
- [ ] App loads in dev mode
- [ ] Web3 wallet connection works
- [ ] Auth flow (SIWE) works
- [ ] API routes respond correctly
- [ ] No console errors about missing env vars

### Questions & Decisions

1. **Legacy `/app/api/actions/` routes**: These are Coinbase Agentkit actions. Should they be:
   - Reorganized under `/web3/actions/`?
   - Kept separate since they're AI-specific?
   - Moved to a separate package?

2. **Store of types**: Some types live in `/types/` root, others would be in `@diversifi/types`. Should we:
   - Keep `/types/` for backwards compatibility?
   - Migrate everything to `@diversifi/types`?

3. **Environment variables**: Currently not strictly validated. Should we:
   - Add Zod schema in `@diversifi/config`?
   - Validate at startup vs build time?

---

## Technical Debt Management

### Current Issues

#### 1. Viem Version Mismatch

**Problem**: The project has multiple versions of the `viem` package installed (2.23.15, 2.28.1, 2.28.3, 2.23.2), causing type incompatibilities between different dependencies.

**Solution**:
- Use type casting in the web3-provider.tsx file to handle type incompatibilities
- Run the `fix:web3-provider` script to apply a minimal implementation that bypasses type checking

```bash
# Fix web3-provider.tsx file
pnpm run fix:web3-provider
```

#### 2. Tailwind CSS Warnings

**Problem**: The codebase contains numerous Tailwind CSS class patterns that could be simplified using newer shorthand syntax.

**Solution**:
- Replace width/height pairs with size shorthand (e.g., 'w-5 h-5' -> 'size-5')
- Update deprecated class names (e.g., 'flex-shrink-0' -> 'shrink-0')
- Run the `fix:tailwind` script to automatically fix these issues

```bash
# Fix Tailwind CSS class issues
pnpm run fix:tailwind
```

#### 3. Path Alias Issues in Farcaster Frame App

**Problem**: The Farcaster frame app uses path aliases like '~/lib/utils' that cause build errors.

**Solution**:
- Replace path aliases with relative imports
- Create the necessary utility files in the correct locations
- Run the `fix:frame-paths` script to automatically fix these issues

```bash
# Fix Farcaster frame path alias issues
pnpm run fix:frame-paths
```

#### 4. React Hook Dependencies

**Problem**: Some React hooks have missing dependencies, causing potential bugs and ESLint warnings.

**Solution**:
- Review and update the dependency arrays in useEffect hooks
- Ensure all variables used inside hooks are included in the dependency array

#### 5. Farcaster Frame Html Component Issue

**Problem**: The Farcaster frame app has an error related to the Html component being imported outside of pages/_document.js.

**Solution**:
- This is a non-critical issue for the main application
- To fix it, the 404.tsx page in the Farcaster frame app needs to be updated to use the correct Next.js components

#### 6. PNPM Workspace Root Dependencies

**Problem**: When adding dependencies in a monorepo with pnpm, the `-w` flag is required to add dependencies to the workspace root. Without this flag, the build process fails with `ERR_PNPM_ADDING_TO_ROOT` errors.

**Solution**:
- Always use the `-w` flag when adding dependencies to the workspace root: `pnpm add -D -w package-name`
- Update build scripts in `netlify.toml` and `scripts/deploy/build.ts` to include the `-w` flag
- For Netlify builds, ensure the build command explicitly includes the `-w` flag for any dependency installations

### Maintenance Scripts

The project includes several maintenance scripts to help manage technical debt:

1. **`fix:viem`**: Updates all viem dependencies to version 2.23.15 to ensure compatibility
2. **`fix:web3-provider`**: Directly fixes the web3-provider.tsx file to handle type incompatibilities
3. **`fix:tailwind`**: Automatically fixes common Tailwind CSS class issues
4. **`fix:frame-paths`**: Fixes path alias issues in the Farcaster frame app
5. **`lint:fix`**: Runs ESLint with auto-fix to address code style issues
6. **`fix:all`**: Runs all the above scripts in sequence to fix all issues at once

When adding new dependencies to the project, always use the `-w` flag for workspace root dependencies:

```bash
# Add a dependency to the workspace root
pnpm add -D -w package-name

# Add a dependency to a specific workspace package
pnpm --filter package-name add dependency-name
```

### Best Practices

To prevent technical debt from accumulating:

1. **Pin Critical Dependencies**: Use exact versions for critical dependencies to prevent unexpected updates
2. **Regular Dependency Audits**: Periodically check for outdated or conflicting dependencies
3. **Consistent Coding Standards**: Follow the established patterns in the codebase
4. **Incremental Refactoring**: Address technical debt in small, manageable chunks
5. **Test Coverage**: Maintain good test coverage to catch issues early
6. **PNPM Workspace Management**: Always use the `-w` flag when adding dependencies to the workspace root, especially in CI/CD scripts

### Future Improvements

1. **Dependency Management**: Consider using tools like Renovate or Dependabot to automate dependency updates
2. **Code Quality Gates**: Implement stricter linting rules and pre-commit hooks
3. **Modularization**: Further break down large components into smaller, more focused ones
4. **Documentation**: Improve inline documentation and component API documentation
