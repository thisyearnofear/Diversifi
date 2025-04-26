"use client";

import { useQuery } from "@tanstack/react-query";
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
  links: Record<
    string,
    {
      link: string;
      handle: string;
      sources: string[];
    }
  >;
  social?: {
    uid: string | null;
    follower: number;
    following: number;
  };
}

// Fetch web3 profile data from the API
const fetchWeb3Profile = async (address: string): Promise<Web3Profile[]> => {
  if (!address) {
    return [];
  }
  
  const response = await fetch(`/api/web3bio?address=${address}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }
  
  return response.json();
};

export function useWeb3ProfileQuery() {
  const { address } = useAccount();
  
  return useQuery({
    queryKey: ['web3Profile', address],
    queryFn: () => fetchWeb3Profile(address || ''),
    enabled: !!address,
    // Cache for 1 hour since profile data rarely changes
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
}
