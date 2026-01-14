import type { Address } from 'viem';

/**
 * Supported blockchain networks
 */
export type ChainId = 8453 | 84532 | 42220; // base, base-sepolia, celo

export interface ChainConfig {
  id: ChainId;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: { http: string[] };
    public: { http: string[] };
  };
}

/**
 * Wallet connection state
 */
export type WalletStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WalletAccount {
  address: Address;
  isConnected: boolean;
  isConnecting: boolean;
  status: WalletStatus;
  chainId?: ChainId;
}

/**
 * Swap data
 */
export interface SwapQuote {
  inputToken: Address;
  outputToken: Address;
  inputAmount: string;
  outputAmount: string;
  slippagePercentage: number;
  priceImpact: number;
}

export interface SwapTransaction {
  to: Address;
  data: `0x${string}`;
  value?: string;
  gasEstimate?: string;
}

/**
 * Token data
 */
export interface Token {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  chainId: ChainId;
}

/**
 * Transaction state
 */
export type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface TransactionState {
  hash?: `0x${string}`;
  status: TransactionStatus;
  error?: string;
  blockNumber?: number;
}
