'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';

// Create a client
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Default stale time of 5 minutes
        staleTime: 5 * 60 * 1000,
        // Default cache time of 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed queries 1 time
        retry: 1,
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
      },
    },
  });

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
