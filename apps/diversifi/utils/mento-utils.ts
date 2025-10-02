// Re-export from new Celo replacement to maintain backward compatibility
// This eliminates @celo/contractkit dependency and Noble package conflicts

export {
  CELO_TOKENS,
  ALFAJORES_TOKENS,
  MENTO_BROKER_ADDRESS,
  ALFAJORES_BROKER_ADDRESS,
  MENTO_ABIS,
  DEFAULT_EXCHANGE_RATES,
  CACHE_KEYS,
  getMentoExchangeRate,
  getExpectedAmountOut,
  getTokenBalance,
  getMultipleTokenBalances,
  handleMentoError,
  getCachedData,
  setCachedData,
  getNetworkConfig,
  getProvider,
  isValidTokenSymbol,
  isValidAmount,
  isValidAddress,
  formatTokenAmount,
  formatCurrency,
} from '../../../lib/celo-replacement/utils';

export {
  NETWORKS,
  TOKEN_METADATA,
  type TokenSymbol,
  type NetworkConfig,
  type TokenMetadata,
} from '../../../lib/celo-replacement/constants';
