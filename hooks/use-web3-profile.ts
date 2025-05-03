'use client';

import {
  useWeb3ProfileQuery,
  type Web3Profile,
} from './api/use-web3-profile-query';

export type { Web3Profile } from './api/use-web3-profile-query';

export function useWeb3Profile() {
  const { data: profiles = [], isLoading, error } = useWeb3ProfileQuery();

  // Helper function to get the primary profile (ENS preferred)
  const getPrimaryProfile = (): Web3Profile | null => {
    if (profiles.length === 0) return null;

    // Prefer ENS
    const ensProfile = profiles.find((p) => p.platform === 'ens');
    if (ensProfile) return ensProfile;

    // Then Farcaster
    const farcasterProfile = profiles.find((p) => p.platform === 'farcaster');
    if (farcasterProfile) return farcasterProfile;

    // Then Lens
    const lensProfile = profiles.find((p) => p.platform === 'lens');
    if (lensProfile) return lensProfile;

    // Otherwise, return the first profile
    return profiles[0];
  };

  return {
    profiles,
    primaryProfile: getPrimaryProfile(),
    isLoading,
    error,
  };
}
