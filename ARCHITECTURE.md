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
