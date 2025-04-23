export interface Token {
  id: string;
  name: string;
  symbol: string;
  region: string;
  chain: string;
  logo?: string;
  description?: string;
  actionPrompt?: string;
  available: boolean; // Whether the token is currently available or coming soon
}

export const tokensByRegion: Record<string, Token[]> = {
  Africa: [
    { id: "ckes", name: "Celo Kenyan Shilling", symbol: "cKES", region: "Africa", chain: "CELO", actionPrompt: "I want to get cKES stablecoins on Celo. Can you help me directly in this chat?", available: true },
    { id: "zar", name: "South African Rand", symbol: "ZAR", region: "Africa", chain: "CELO", actionPrompt: "I want to get ZAR stablecoins. Can you help me directly in this chat?", available: false },
    { id: "ngn", name: "Nigerian Naira", symbol: "NGN", region: "Africa", chain: "CELO", actionPrompt: "I want to get NGN stablecoins. Can you help me directly in this chat?", available: false },
    { id: "cghs", name: "Celo Ghanaian Cedi", symbol: "cGHS", region: "Africa", chain: "CELO", actionPrompt: "I want to get cGHS stablecoins on Celo. Can you help me directly in this chat?", available: false },
    { id: "exof", name: "eXOF", symbol: "eXOF", region: "Africa", chain: "CELO", actionPrompt: "I want to get eXOF stablecoins. Can you help me directly in this chat?", available: false },
  ],
  Europe: [
    { id: "eura", name: "EURA", symbol: "EURA", region: "Europe", chain: "OPTIMISM", actionPrompt: "I want to get Euro-backed stablecoins on Optimism. Can you help me directly in this chat?", available: true },
    { id: "eurc", name: "Euro Coin", symbol: "EURC", region: "Europe", chain: "ETHEREUM", actionPrompt: "I want to get EURC stablecoins. Can you help me directly in this chat?", available: false },
    { id: "ceur", name: "Celo Euro", symbol: "CEUR", region: "Europe", chain: "CELO", actionPrompt: "I want to get CEUR stablecoins on Celo. Can you help me directly in this chat?", available: false },
    { id: "eurt", name: "Tether Euro", symbol: "EURt", region: "Europe", chain: "ETHEREUM", actionPrompt: "I want to get EURt stablecoins. Can you help me directly in this chat?", available: false },
  ],
  USA: [
    { id: "usdc", name: "USD Coin", symbol: "USDC", region: "USA", chain: "ETHEREUM", actionPrompt: "I want to get USDC stablecoins. Can you help me directly in this chat?", available: false },
    { id: "usdt", name: "Tether USD", symbol: "USDT", region: "USA", chain: "ETHEREUM", actionPrompt: "I want to get USDT stablecoins. Can you help me directly in this chat?", available: false },
    { id: "cusd", name: "Celo Dollar", symbol: "cUSD", region: "USA", chain: "CELO", actionPrompt: "I want to get USD-backed stablecoins on Celo. Can you help me directly in this chat?", available: true },
    { id: "usdbc", name: "USD Base Coin", symbol: "USDbC", region: "USA", chain: "BASE", actionPrompt: "I want to get USD-backed stablecoins on Base. Can you help me directly in this chat?", available: true },
    { id: "dai", name: "DAI", symbol: "DAI", region: "USA", chain: "POLYGON", actionPrompt: "I want to get DAI stablecoins on Polygon. Can you help me directly in this chat?", available: true },
  ],
  LatAm: [
    { id: "creal", name: "Celo Brazilian Real", symbol: "cREAL", region: "LatAm", chain: "CELO", actionPrompt: "I want to get cREAL stablecoins on Celo. Can you help me directly in this chat?", available: false },
    { id: "ccop", name: "Celo Colombian Peso", symbol: "cCOP", region: "LatAm", chain: "CELO", actionPrompt: "I want to get cCOP stablecoins on Celo. Can you help me directly in this chat?", available: true },
    { id: "mxnt", name: "Mexican Peso Tether", symbol: "MXNT", region: "LatAm", chain: "ETHEREUM", actionPrompt: "I want to get MXNT stablecoins. Can you help me directly in this chat?", available: false },
    { id: "brz", name: "Brazilian Real", symbol: "BRZ", region: "LatAm", chain: "POLYGON", actionPrompt: "I want to get BRZ stablecoins on Polygon. Can you help me directly in this chat?", available: false },
  ],
  Asia: [
    { id: "puso", name: "Philippine Peso", symbol: "PUSO", region: "Asia", chain: "ETHEREUM", actionPrompt: "I want to get PUSO stablecoins. Can you help me directly in this chat?", available: false },
    { id: "idrt", name: "Indonesian Rupiah", symbol: "IDRT", region: "Asia", chain: "ETHEREUM", actionPrompt: "I want to get IDRT stablecoins. Can you help me directly in this chat?", available: false },
    { id: "xsgd", name: "Singapore Dollar", symbol: "XSGD", region: "Asia", chain: "ETHEREUM", actionPrompt: "I want to get XSGD stablecoins. Can you help me directly in this chat?", available: false },
    { id: "jpyc", name: "Japanese Yen", symbol: "JPYC", region: "Asia", chain: "ETHEREUM", actionPrompt: "I want to get JPYC stablecoins. Can you help me directly in this chat?", available: false },
  ],
  RWA: [
    { id: "xaut", name: "Tether Gold", symbol: "XAUT", region: "RWA", chain: "ETHEREUM", actionPrompt: "I want to get XAUT gold-backed tokens. Can you help me directly in this chat?", available: false },
    { id: "paxg", name: "PAX Gold", symbol: "PAXG", region: "RWA", chain: "ETHEREUM", actionPrompt: "I want to get PAXG gold-backed tokens. Can you help me directly in this chat?", available: false },
    { id: "kau", name: "Kinesis Gold", symbol: "$KAU", region: "RWA", chain: "ETHEREUM", actionPrompt: "I want to get $KAU gold-backed tokens. Can you help me directly in this chat?", available: false },
    { id: "kag", name: "Kinesis Silver", symbol: "$KAG", region: "RWA", chain: "ETHEREUM", actionPrompt: "I want to get $KAG silver-backed tokens. Can you help me directly in this chat?", available: false },
  ],
};

// Helper function to get all tokens
export function getAllTokens(): Token[] {
  return Object.values(tokensByRegion).flat();
}

// Helper function to get tokens by region
export function getTokensByRegion(region: string): Token[] {
  if (region === "All") {
    return getAllTokens();
  }
  return tokensByRegion[region] || [];
}

// Helper function to get available tokens by region
export function getAvailableTokensByRegion(region: string): Token[] {
  const tokens = getTokensByRegion(region);
  return tokens.filter(token => token.available);
}

// Helper function to get coming soon tokens by region
export function getComingSoonTokensByRegion(region: string): Token[] {
  const tokens = getTokensByRegion(region);
  return tokens.filter(token => !token.available);
}
