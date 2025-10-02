// Celo/Mento constants without SDK dependencies
// This replaces @celo/contractkit to eliminate Noble package conflicts

// Token addresses on Celo (Mainnet)
export const CELO_TOKENS = {
  CELO: "0x471ece3750da237f93b8e339c536989b8978a438",
  CUSD: "0x765de816845861e75a25fca122bb6898b8b1282a",
  CEUR: "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73",
  CREAL: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
  CKES: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0",
  CCOP: "0x8a567e2ae79ca692bd748ab832081c45de4041ea",
  PUSO: "0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b",
} as const;

// Token addresses on Celo Alfajores (Testnet) for Mento v2.0
export const ALFAJORES_TOKENS = {
  CELO: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9",
  CUSD: "0x874069fa1eb16d44d622f2e0ca25eea172369bc1",
  CEUR: "0x10c892a6ec43a53e45d0b916b4b7d383b1b78c0f",
  CREAL: "0xe4d517785d091d3c54818832db6094bcc2744545",
  CXOF: "0xB0FA15e002516d0301884059c0aaC0F0C72b019D",
  CKES: "0x1E0433C1769271ECcF4CFF9FDdD515eefE6CdF92",
  CPESO: "0x5E0E3c9419C42a1B04e2525991FB1A2C467AB8bF",
  CCOP: "0xe6A57340f0df6E020c1c0a80bC6E13048601f0d4",
  CGHS: "0x295B66bE7714458Af45E6A6Ea142A5358A6cA375",
  CGBP: "0x47f2Fb88105155a18c390641C8a73f1402B2BB12",
  CZAR: "0x1e5b44015Ff90610b54000DAad31C89b3284df4d",
  CCAD: "0x02EC9E0D2Fd73e89168C1709e542a48f58d7B133",
  CAUD: "0x84CBD49F5aE07632B6B88094E81Cce8236125Fe0",
  PUSO: "0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b",
} as const;

// Mento Broker addresses
export const MENTO_BROKER_ADDRESS =
  "0x777a8255ca72412f0d706dc03c9d1987306b4cad"; // Mainnet
export const ALFAJORES_BROKER_ADDRESS =
  "0xD3Dff18E465bCa6241A244144765b4421Ac14D09"; // Alfajores

// Standard ERC20 ABI - minimal interface we actually use
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
] as const;

// Mento Broker ABI - only the functions we use
export const BROKER_ABI = [
  "function getProviders() view returns (address[] memory)",
  "function getProviderById(bytes32 id) view returns (address)",
  "function getAmountOut(address sellAsset, address buyAsset, uint256 sellAmount) view returns (uint256)",
] as const;

// Mento Exchange ABI - only the functions we use
export const EXCHANGE_ABI = [
  "function getAmountOut(address sellAsset, address buyAsset, uint256 sellAmount) view returns (uint256)",
  "function exchange(address sellAsset, address buyAsset, uint256 sellAmount, uint256 minBuyAmount) returns (uint256)",
] as const;

// Combined ABIs object for backward compatibility
export const MENTO_ABIS = {
  ERC20_FULL: ERC20_ABI,
  ERC20_BALANCE: [
    "function balanceOf(address owner) view returns (uint256)",
  ] as const,
  ERC20_ALLOWANCE: [
    "function allowance(address owner, address spender) view returns (uint256)",
  ] as const,
  ERC20_APPROVE: [
    "function approve(address spender, uint256 amount) returns (bool)",
  ] as const,
  BROKER_PROVIDERS: BROKER_ABI,
  BROKER_RATE: BROKER_ABI,
  EXCHANGE: EXCHANGE_ABI,
} as const;

// Default exchange rates for fallback calculations
export const DEFAULT_EXCHANGE_RATES = {
  CUSD: 1.0,
  CEUR: 1.09,
  CREAL: 0.18,
  CKES: 0.0076,
  CCOP: 0.00024,
  PUSO: 0.018,
  CXOF: 0.0016,
  CPESO: 0.0179,
  CGBP: 1.27,
  CGHS: 0.075,
  CZAR: 0.055,
  CCAD: 0.74,
  CAUD: 0.67,
} as const;

// Network configuration
export const NETWORKS = {
  CELO_MAINNET: {
    chainId: 42220,
    name: "Celo",
    rpcUrl: "https://forno.celo.org",
    tokens: CELO_TOKENS,
    brokerAddress: MENTO_BROKER_ADDRESS,
  },
  ALFAJORES: {
    chainId: 44787,
    name: "Alfajores",
    rpcUrl: "https://alfajores-forno.celo-testnet.org",
    tokens: ALFAJORES_TOKENS,
    brokerAddress: ALFAJORES_BROKER_ADDRESS,
  },
} as const;

// Cache keys for exchange rate caching
export const CACHE_KEYS = {
  EXCHANGE_RATE_CKES: "exchange_rate_ckes",
  EXCHANGE_RATE_CCOP: "exchange_rate_ccop",
  EXCHANGE_RATE_PUSO: "exchange_rate_puso",
} as const;

// Token metadata
export const TOKEN_METADATA = {
  CUSD: { name: "Celo Dollar", region: "Global", decimals: 18 },
  CEUR: { name: "Celo Euro", region: "Europe", decimals: 18 },
  CREAL: { name: "Celo Real", region: "South America", decimals: 18 },
  CKES: { name: "Kenyan Shilling", region: "Africa", decimals: 18 },
  CCOP: { name: "Colombian Peso", region: "South America", decimals: 18 },
  PUSO: { name: "Philippine Peso", region: "Asia", decimals: 18 },
  CXOF: { name: "CFA Franc", region: "Africa", decimals: 18 },
  CPESO: { name: "Philippine Peso", region: "Asia", decimals: 18 },
  CGBP: { name: "British Pound", region: "Europe", decimals: 18 },
  CGHS: { name: "Ghanaian Cedi", region: "Africa", decimals: 18 },
  CZAR: { name: "South African Rand", region: "Africa", decimals: 18 },
  CCAD: { name: "Canadian Dollar", region: "North America", decimals: 18 },
  CAUD: { name: "Australian Dollar", region: "Oceania", decimals: 18 },
} as const;

// Type exports for TypeScript support
export type TokenSymbol =
  | keyof typeof CELO_TOKENS
  | keyof typeof ALFAJORES_TOKENS;
export type NetworkConfig = typeof NETWORKS.CELO_MAINNET;
export type TokenMetadata =
  (typeof TOKEN_METADATA)[keyof typeof TOKEN_METADATA];
