// Mento utility functions without SDK dependencies
// This replaces @celo/contractkit and @mento-protocol/mento-sdk functionality

import { ethers } from 'ethers';
import {
  NETWORKS,
  DEFAULT_EXCHANGE_RATES,
  MENTO_ABIS,
  CACHE_KEYS,
  type TokenSymbol
} from './constants';

// Simple in-memory cache for exchange rates
const cache = new Map<string, { value: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache utilities
export function getCachedData(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

export function setCachedData(key: string, value: any): void {
  cache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL
  });
}

// Network helpers
export function getNetworkConfig(chainId: number) {
  switch (chainId) {
    case 42220:
      return NETWORKS.CELO_MAINNET;
    case 44787:
      return NETWORKS.ALFAJORES;
    default:
      return NETWORKS.CELO_MAINNET; // fallback
  }
}

export function getProvider(chainId: number): ethers.JsonRpcProvider {
  const network = getNetworkConfig(chainId);
  return new ethers.JsonRpcProvider(network.rpcUrl);
}

// Exchange rate fetching
export async function getMentoExchangeRate(
  tokenSymbol: string,
  chainId: number = 42220
): Promise<number> {
  try {
    const network = getNetworkConfig(chainId);
    const provider = getProvider(chainId);

    // Get token addresses
    const fromTokenAddress = network.tokens.CUSD; // Base currency
    const toTokenAddress = network.tokens[tokenSymbol as keyof typeof network.tokens];

    if (!toTokenAddress) {
      console.warn(`Token ${tokenSymbol} not found on network ${chainId}`);
      return DEFAULT_EXCHANGE_RATES[tokenSymbol as keyof typeof DEFAULT_EXCHANGE_RATES] || 1;
    }

    // Create broker contract
    const brokerContract = new ethers.Contract(
      network.brokerAddress,
      MENTO_ABIS.BROKER_RATE,
      provider
    );

    // Try to get exchange rate
    const oneUnit = ethers.parseUnits('1', 18);
    const expectedAmountOut = await brokerContract.getAmountOut(
      fromTokenAddress,
      toTokenAddress,
      oneUnit
    );

    const rate = Number(ethers.formatUnits(expectedAmountOut, 18));

    // Cache the result
    setCachedData(`exchange_rate_${tokenSymbol.toLowerCase()}`, rate);

    return rate;
  } catch (error) {
    console.error(`Error fetching Mento rate for ${tokenSymbol}:`, error);

    // Return default rate as fallback
    return DEFAULT_EXCHANGE_RATES[tokenSymbol as keyof typeof DEFAULT_EXCHANGE_RATES] || 1;
  }
}

// Get expected amount out for a swap
export async function getExpectedAmountOut(
  fromToken: string,
  toToken: string,
  amount: string,
  chainId: number = 42220
): Promise<string> {
  try {
    const network = getNetworkConfig(chainId);
    const provider = getProvider(chainId);

    const fromTokenAddress = network.tokens[fromToken as keyof typeof network.tokens];
    const toTokenAddress = network.tokens[toToken as keyof typeof network.tokens];

    if (!fromTokenAddress || !toTokenAddress) {
      throw new Error(`Invalid token addresses: ${fromToken}/${toToken}`);
    }

    // Parse amount to wei
    const amountWei = ethers.parseUnits(amount, 18);

    // Create broker contract
    const brokerContract = new ethers.Contract(
      network.brokerAddress,
      MENTO_ABIS.BROKER_RATE,
      provider
    );

    // Get expected amount out
    const expectedAmountOut = await brokerContract.getAmountOut(
      fromTokenAddress,
      toTokenAddress,
      amountWei
    );

    return ethers.formatUnits(expectedAmountOut, 18);
  } catch (error) {
    console.error('Error getting expected amount out:', error);

    // Fallback calculation using exchange rates
    const amountNum = Number(amount);
    const fromRate = DEFAULT_EXCHANGE_RATES[fromToken as keyof typeof DEFAULT_EXCHANGE_RATES] || 1;
    const toRate = DEFAULT_EXCHANGE_RATES[toToken as keyof typeof DEFAULT_EXCHANGE_RATES] || 1;

    const expectedOutput = (amountNum * fromRate) / toRate;
    return expectedOutput.toString();
  }
}

// Get token balance
export async function getTokenBalance(
  tokenSymbol: string,
  userAddress: string,
  chainId: number = 42220
): Promise<string> {
  try {
    const network = getNetworkConfig(chainId);
    const provider = getProvider(chainId);

    const tokenAddress = network.tokens[tokenSymbol as keyof typeof network.tokens];
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found on network ${chainId}`);
    }

    // Create token contract
    const tokenContract = new ethers.Contract(
      tokenAddress,
      MENTO_ABIS.ERC20_FULL,
      provider
    );

    // Get balance
    const balance = await tokenContract.balanceOf(userAddress);
    return ethers.formatUnits(balance, 18);
  } catch (error) {
    console.error(`Error getting balance for ${tokenSymbol}:`, error);
    return '0';
  }
}

// Get multiple token balances
export async function getMultipleTokenBalances(
  tokenSymbols: string[],
  userAddress: string,
  chainId: number = 42220
): Promise<Record<string, string>> {
  const balances: Record<string, string> = {};

  await Promise.all(
    tokenSymbols.map(async (symbol) => {
      balances[symbol] = await getTokenBalance(symbol, userAddress, chainId);
    })
  );

  return balances;
}

// Error handling
export function handleMentoError(error: any, operation: string = 'operation'): string {
  console.error(`Mento error during ${operation}:`, error);

  if (error?.message?.includes('insufficient funds')) {
    return 'Insufficient funds for this transaction';
  }

  if (error?.message?.includes('slippage')) {
    return 'Price impact too high. Try reducing the amount or adjusting slippage tolerance.';
  }

  if (error?.message?.includes('reverted')) {
    return 'Transaction would fail. Please check your inputs and try again.';
  }

  if (error?.message?.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error?.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Unable to estimate gas. Transaction may fail.';
  }

  if (error?.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds to cover gas fees';
  }

  // Generic fallback
  return `Failed to ${operation}. Please try again.`;
}

// Validation helpers
export function isValidTokenSymbol(symbol: string, chainId: number = 42220): boolean {
  const network = getNetworkConfig(chainId);
  return symbol in network.tokens;
}

export function isValidAmount(amount: string): boolean {
  try {
    const num = Number(amount);
    return !isNaN(num) && num > 0 && num < Number.MAX_SAFE_INTEGER;
  } catch {
    return false;
  }
}

export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

// Format helpers
export function formatTokenAmount(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (num === 0) return '0';
  if (num < 0.000001) return '< 0.000001';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

export function formatCurrency(amount: string | number, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Re-export constants for backward compatibility
export {
  CELO_TOKENS,
  ALFAJORES_TOKENS,
  MENTO_BROKER_ADDRESS,
  ALFAJORES_BROKER_ADDRESS,
  MENTO_ABIS,
  DEFAULT_EXCHANGE_RATES,
  CACHE_KEYS,
} from './constants';
