"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

// Types for starter kit data
export interface StarterKit {
  id: string;
  creatorId: string | null;
  claimerId: string | null;
  chargeId: string | null;
  createdAt: string;
  claimedAt: string | null;
  value: number;
  balance: number;
  deletedAt: string | null;
}

// Fetch available starter kits
const fetchAvailableStarterKits = async (): Promise<StarterKit[]> => {
  const response = await fetch('/api/starter-kit/available');

  if (!response.ok) {
    throw new Error(`Failed to fetch available starter kits: ${response.status}`);
  }

  return response.json();
};

// Fetch created starter kits
const fetchCreatedStarterKits = async (): Promise<StarterKit[]> => {
  const response = await fetch('/api/starter-kit/created/list');

  if (!response.ok) {
    throw new Error(`Failed to fetch created starter kits: ${response.status}`);
  }

  return response.json();
};

// Fetch claimed starter kits
const fetchClaimedStarterKits = async (): Promise<StarterKit[]> => {
  const response = await fetch('/api/starter-kit/claimed/list');

  if (!response.ok) {
    throw new Error(`Failed to fetch claimed starter kits: ${response.status}`);
  }

  return response.json();
};

// Hook for available starter kits
export function useAvailableStarterKits() {
  return useQuery({
    queryKey: ['starterKits', 'available'],
    queryFn: fetchAvailableStarterKits,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for created starter kits
export function useCreatedStarterKits() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['starterKits', 'created', address],
    queryFn: fetchCreatedStarterKits,
    enabled: !!address,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for claimed starter kits
export function useClaimedStarterKits() {
  const { address } = useAccount();

  return useQuery({
    queryKey: ['starterKits', 'claimed', address],
    queryFn: fetchClaimedStarterKits,
    enabled: !!address,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
