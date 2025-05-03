'use client';

import { useSimpleAuth } from '@/app/providers/auth-provider';

export function useAuth() {
  const auth = useSimpleAuth();

  return {
    ...auth,
  };
}
