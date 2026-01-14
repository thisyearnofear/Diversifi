'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { ReactQueryProvider } from '@/lib/react-query';
import { RegionProvider } from '@/contexts/region-context';
import { SidebarProvider } from '@/components/ui/sidebar';
import { SWRConfig } from 'swr';

// Lazy load Web3Provider since it's heavy
const Web3Provider = dynamic(
  () => import('@/app/providers/web3-provider').then((mod) => mod.Web3Provider),
  { ssr: false },
);

const AuthProvider = dynamic(
  () => import('@/app/providers/auth-provider').then((mod) => mod.AuthProvider),
  { ssr: false },
);

interface RootProviderProps {
  children: ReactNode;
}

/**
 * RootProvider - Single composition point for all app providers
 * 
 * Ordering matters:
 * 1. ThemeProvider - must be first (handles theme)
 * 2. ReactQueryProvider - for data fetching
 * 3. Web3Provider - wagmi + wallet
 * 4. AuthProvider - auth state
 * 5. RegionProvider - region selection
 * 6. SidebarProvider - UI state
 */
export function RootProvider({ children }: RootProviderProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <Toaster position="top-center" />
      <SWRConfig value={{ provider: () => new Map(), revalidateOnFocus: false }}>
        <ReactQueryProvider>
          <Web3Provider>
            <AuthProvider>
              <RegionProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </RegionProvider>
            </AuthProvider>
          </Web3Provider>
        </ReactQueryProvider>
      </SWRConfig>
    </ThemeProvider>
  );
}
