import type { Address } from 'viem';

/**
 * User profile
 */
export interface User {
  id: string;
  address: Address;
  email?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Region/Market data
 */
export interface Region {
  code: string;
  name: string;
  country: string;
  currency: string;
  timezone: string;
}

/**
 * Currency performance data
 */
export interface CurrencyPerformance {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  timestamp: number;
}

/**
 * Commerce/Commerce related types
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
}

export interface Charge {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'resolved';
  chargeCode?: string;
  createdAt: Date;
}

/**
 * Reward system
 */
export interface Reward {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  reason: string;
  claimedAt?: Date;
  createdAt: Date;
}

/**
 * Voting system
 */
export interface Vote {
  id: string;
  userId: string;
  proposalId: string;
  choice: number;
  weight: number;
  timestamp: Date;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  options: string[];
  voteCount: number[];
  status: 'active' | 'closed' | 'passed' | 'failed';
  createdAt: Date;
  endsAt: Date;
}
