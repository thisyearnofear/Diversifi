# Quick Start Guide

## For New Features

### 1. Define Types
```tsx
// packages/types/src/domain.ts
export interface MyEntity {
  id: string;
  name: string;
}
```

### 2. Create API Route
```tsx
// app/api/my-feature/route.ts
import type { MyEntity } from '@diversifi/types';

export async function GET() {
  const data: MyEntity[] = [];
  return Response.json(data);
}
```

### 3. Create Client Component
```tsx
// app/components/my-feature.tsx
'use client';

import { useState } from 'react';
import type { MyEntity } from '@diversifi/types';

export function MyFeature() {
  const [data, setData] = useState<MyEntity[]>([]);
  
  return <div>{/* ... */}</div>;
}
```

### 4. Create Server Action
```tsx
// app/actions/my-feature.ts
'use server';

import { db } from '@/lib/db';
import type { MyEntity } from '@diversifi/types';

export async function fetchMyEntity(id: string): Promise<MyEntity> {
  return db.myEntity.findUnique({ where: { id } });
}
```

## Import Patterns

### Types (Always use these)
```tsx
import type { User, Message, Token } from '@diversifi/types';
```

### Shared Constants (Lightweight)
```tsx
import { REGIONS } from '@diversifi/shared/constants';
import { SUPPORTED_CHAINS } from '@diversifi/shared';
```

### Shared Web3 Hooks (Heavy, but needed)
```tsx
import { useWalletBase, useSwapBase } from '@diversifi/shared/web3';
```

### Shared Components
```tsx
import { CurrencyPerformanceChart } from '@diversifi/shared/ui';
```

### Environment Variables
```tsx
import { env } from '@diversifi/config';

// Server-side (safe)
const dbUrl = env.POSTGRES_URL;

// Client-side (must be NEXT_PUBLIC_)
const chainId = env.NEXT_PUBLIC_ACTIVE_CHAIN;
```

## Component Structure

```tsx
'use client';

import type { ReactNode } from 'react';
import type { MyType } from '@diversifi/types';
import { useMyHook } from '@/hooks/use-my-hook';

interface MyComponentProps {
  items: MyType[];
  children: ReactNode;
}

export function MyComponent({ items, children }: MyComponentProps) {
  const state = useMyHook();
  
  return (
    <div>
      {children}
    </div>
  );
}
```

## API Route Structure

```tsx
// app/api/feature/route.ts
import type { ApiResponse } from '@diversifi/types';
import { env } from '@diversifi/config';

export async function GET(request: Request) {
  try {
    const data = await fetchData();
    
    return Response.json({
      success: true,
      data,
      timestamp: Date.now(),
    } as ApiResponse<typeof data>);
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
```

## Server Action Structure

```tsx
// app/actions/my-action.ts
'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import type { User } from '@diversifi/types';

export async function updateUser(id: string, data: Partial<User>) {
  const user = await db.user.update({
    where: { id },
    data,
  });
  
  revalidatePath('/profile');
  return user;
}
```

## Provider Usage

All providers are in `RootProvider`:

```tsx
// app/layout.tsx
import { RootProvider } from '@/app/providers/root-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RootProvider>
          <main>{children}</main>
        </RootProvider>
      </body>
    </html>
  );
}
```

Don't add new providers to layout - add them to `RootProvider` instead.

## Build & Dev

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build:packages

# Dev mode
pnpm dev

# Full build
pnpm build

# Type check
pnpm typecheck

# Lint
pnpm lint
pnpm lint:fix
```

## Debugging

### Type Errors
```bash
# Check TypeScript
pnpm typecheck

# Specific package
cd packages/types && pnpm build
```

### Build Errors
```bash
# Clear build cache
pnpm build:packages --force

# Check imports
grep -r "from '@diversifi" app/
```

### Runtime Errors
- Check browser console (client errors)
- Check server logs (server errors)
- Check env variables loaded: `import { env } from '@diversifi/config'; console.log(env)`

## Common Patterns

### Conditional Server/Client Code
```tsx
// app/lib/user.server.ts - server only
import 'server-only';

export async function getUserFromDB(id: string) {
  // This will error if imported in client code
}
```

### Using Context in Client Components
```tsx
'use client';

import { createContext, useContext } from 'react';

const MyContext = createContext<MyContextType | undefined>(undefined);

export function useMyContext() {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be in MyProvider');
  return context;
}
```

### Fetching Data in Server Components
```tsx
import { db } from '@/lib/db';
import type { User } from '@diversifi/types';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user: User = await db.user.findUnique({ where: { id: params.id } });
  
  return <div>{user.name}</div>;
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Module not found" | Run `pnpm install`, check import path |
| Type errors | Run `pnpm typecheck`, check `@diversifi/types` |
| Env var undefined | Check `.env.example`, run with `--filter` if in packages |
| Web3 failing | Check `env.NEXT_PUBLIC_ACTIVE_CHAIN` is set |
| Build hangs | Kill process, clear `.next`, try `pnpm build:packages` first |
| Circular dependency | Use `@diversifi/types` to break cycles |
