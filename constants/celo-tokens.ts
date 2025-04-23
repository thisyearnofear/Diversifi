// Constants for Celo tokens and contracts
export const ADDRESSES = {
  CELO: "0x471ece3750da237f93b8e339c536989b8978a438",
  CKES: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
  CUSD: "0x765de816845861e75a25fca122bb6898b8b1282a",
  BROKER: "0x777a8255ca72412f0d706dc03c9d1987306b4cad"
};

export const CACHE_KEYS = {
  EXCHANGE_RATE: 'ckes-exchange-rate-cache',
  BALANCE: 'ckes-balance-cache'
};

export const CACHE_DURATIONS = {
  EXCHANGE_RATE: 1000 * 60 * 60, // 1 hour
  BALANCE: 1000 * 60 * 5 // 5 minutes
};

export const ABIS = {
  ERC20_BALANCE: ["function balanceOf(address) view returns (uint256)"],
  ERC20_ALLOWANCE: ["function allowance(address owner, address spender) view returns (uint256)"],
  ERC20_APPROVE: ["function approve(address spender, uint256 amount) returns (bool)"],
  BROKER_PROVIDERS: ["function getExchangeProviders() view returns (address[])"],
  EXCHANGE: ["function getExchanges() view returns ((bytes32 exchangeId, address[] assets)[])"],
  BROKER_RATE: ["function getAmountOut(address exchangeProvider, bytes32 exchangeId, address assetIn, address assetOut, uint256 amountIn) view returns (uint256)"],
  BROKER_SWAP: ["function swapIn(address exchangeProvider, bytes32 exchangeId, address assetIn, address assetOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)"]
};

// Swap status types
export type CkesSwapStatus =
  | "idle"
  | "checking"
  | "not-swapped"
  | "swapping"
  | "approving"
  | "approved"
  | "transaction-pending"
  | "transaction-submitted"
  | "transaction-confirming"
  | "transaction-success"
  | "completing"
  | "completed"
  | "switching-network"
  | "error";

export interface SwapParams {
  amount: number;
}

export interface UseCkesSwapOptions {
  onComplete?: () => void;
}

export interface SwapConfig {
  exchangeProvider: string;
  exchangeId: string;
  inputToken: string;
  outputToken: string;
}
