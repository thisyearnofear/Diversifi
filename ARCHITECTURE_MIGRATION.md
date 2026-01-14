# Architecture Migration Checklist

## Phase 1: Foundation ✅ DONE

- [x] Create `@diversifi/types` package with domain types
- [x] Create environment validation in `@diversifi/config`
- [x] Split `@diversifi/shared` into granular entry points
- [x] Create `RootProvider` for unified provider composition
- [x] Update `app/layout.tsx` to use `RootProvider`
- [x] Document architecture in `ARCHITECTURE.md`

## Phase 2: API Route Organization (NEXT)

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

## Phase 3: Server/Client Code Splitting (PENDING)

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

## Phase 4: Hook Consolidation (PENDING)

**Status:** Hooks spread across `app/hooks/` and `packages/shared/hooks/`

### Goals
- [ ] Move reusable hooks to `@diversifi/shared/web3` or `@diversifi/shared/hooks`
- [ ] Keep app-specific hooks in `app/hooks/`

### Hooks to Evaluate
- `app/hooks/use-transaction.ts` - reusable? Move to shared
- `app/hooks/use-wallet.ts` - reusable? Move to shared
- Custom hooks in components - refactor to `app/hooks/`

## Phase 5: Build Optimization (PENDING)

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

## Phase 6: Type Safety Improvements (PENDING)

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

## Phase 7: Provider Cleanup (PENDING)

### Status
- [x] Created `RootProvider` to unify provider composition
- [ ] Remove old provider wrapper files (after verifying nothing imports them)
- [ ] Delete `/lib/web3/providers.tsx`
- [ ] Delete or deprecate `/app/providers/` individual files

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Build fails | Run `pnpm install && pnpm build` incrementally |
| Import paths break | Search for old imports, update systematically |
| Circular dependencies | Use `@diversifi/types` as foundation |
| Performance regression | Bundle analyze before/after |

## Testing Checklist

- [ ] `pnpm install` completes
- [ ] `pnpm build:packages` builds @diversifi/types and @diversifi/shared
- [ ] `pnpm build` (Next.js) completes without warnings
- [ ] App loads in dev mode
- [ ] Web3 wallet connection works
- [ ] Auth flow (SIWE) works
- [ ] API routes respond correctly
- [ ] No console errors about missing env vars

## Questions & Decisions

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
