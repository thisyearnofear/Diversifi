"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export interface Web3Profile {
  address: string;
  identity: string;
  platform: string;
  displayName: string;
  avatar: string | null;
  description: string | null;
  status: string | null;
  email: string | null;
  location: string | null;
  header: string | null;
  contenthash: string | null;
  links: Record<string, {
    link: string;
    handle: string;
    sources: string[];
  }>;
  social?: {
    uid: string | null;
    follower: number;
    following: number;
  };
}

export function useWeb3Profile() {
  const { address } = useAccount();
  const [profiles, setProfiles] = useState<Web3Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://api.web3.bio/profile/${address}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        setProfiles(data);
      } catch (err) {
        console.error("Error fetching web3 profile:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      fetchProfile();
    } else {
      setProfiles([]);
    }
  }, [address]);

  // Helper function to get the primary profile (ENS preferred)
  const getPrimaryProfile = (): Web3Profile | null => {
    if (profiles.length === 0) return null;
    
    // Prefer ENS
    const ensProfile = profiles.find(p => p.platform === "ens");
    if (ensProfile) return ensProfile;
    
    // Then Farcaster
    const farcasterProfile = profiles.find(p => p.platform === "farcaster");
    if (farcasterProfile) return farcasterProfile;
    
    // Then Lens
    const lensProfile = profiles.find(p => p.platform === "lens");
    if (lensProfile) return lensProfile;
    
    // Otherwise, return the first profile
    return profiles[0];
  };

  return {
    profiles,
    primaryProfile: getPrimaryProfile(),
    isLoading,
    error
  };
}
