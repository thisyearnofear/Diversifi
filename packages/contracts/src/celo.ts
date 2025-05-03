import { ethers } from 'ethers';

// Celo stablecoin addresses
const BROKER_ADDRESS = '0x777a8255ca72412f0d706dc03c9d1987306b4cad';

// ABIs
const ABIS = {
  ERC20_BALANCE: ['function balanceOf(address) view returns (uint256)'],
  ERC20_ALLOWANCE: [
    'function allowance(address owner, address spender) view returns (uint256)',
  ],
  ERC20_APPROVE: [
    'function approve(address spender, uint256 amount) returns (bool)',
  ],
  BROKER_PROVIDERS: [
    'function getExchangeProviders() view returns (address[])',
  ],
  EXCHANGE: [
    'function getExchanges() view returns ((bytes32 exchangeId, address[] assets)[])',
  ],
  BROKER_RATE: [
    'function getAmountOut(address exchangeProvider, bytes32 exchangeId, address assetIn, address assetOut, uint256 amountIn) view returns (uint256)',
  ],
  BROKER_SWAP: [
    'function swapIn(address exchangeProvider, bytes32 exchangeId, address assetIn, address assetOut, uint256 amountIn, uint256 minAmountOut) returns (uint256)',
  ],
};

// Celo stablecoin addresses
const STABLECOIN_ADDRESSES = {
  cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
  cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
} as const;

export type CeloStablecoin = keyof typeof STABLECOIN_ADDRESSES;

/**
 * Get balance of a specific Celo stablecoin for an address
 */
export async function getStablecoinBalance(
  address: string,
  token: CeloStablecoin,
) {
  try {
    // Create a read-only provider for Celo mainnet
    const provider = new ethers.providers.JsonRpcProvider(
      'https://forno.celo.org',
    );

    // Create contract instance
    const tokenContract = new ethers.Contract(
      STABLECOIN_ADDRESSES[token],
      ABIS.ERC20_BALANCE,
      provider,
    );

    // Get balance
    const balance = await tokenContract.balanceOf(address);

    // Return as string
    return balance.toString();
  } catch (error) {
    console.error(`Error getting ${token} balance:`, error);
    return '0';
  }
}

/**
 * Get all Celo stablecoin balances for an address
 */
export async function getAllStablecoinBalances(address: string) {
  try {
    // For Edge runtime compatibility, we'll use mock data initially
    // In a production environment, you would implement proper fetching
    return {
      cUSD: '1000000000000000000', // 1 cUSD
      cEUR: '2000000000000000000', // 2 cEUR
      cREAL: '3000000000000000000', // 3 cREAL
    };

    // The code below would be used in a non-Edge environment:
    /*
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");

    const balances = await Promise.all(
      Object.entries(STABLECOIN_ADDRESSES).map(async ([token, tokenAddress]) => {
        try {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            ABIS.ERC20_BALANCE,
            provider
          );

          const balance = await tokenContract.balanceOf(address);
          return { token, balance: balance.toString() };
        } catch (error) {
          console.error(`Error getting ${token} balance:`, error);
          return { token, balance: "0" };
        }
      })
    );

    return Object.fromEntries(
      balances.map(({ token, balance }) => [token, balance])
    );
    */
  } catch (error) {
    console.error('Error getting all stablecoin balances:', error);
    return {
      cUSD: '0',
      cEUR: '0',
      cREAL: '0',
    };
  }
}

/**
 * Get exchange rates for Celo stablecoins
 */
export async function getStablecoinRates() {
  try {
    // For Edge runtime compatibility, we'll use mock data initially
    return {
      cUSD: '1.0',
      cEUR: '1.1',
      cREAL: '0.2',
    };

    // The code below would be used in a non-Edge environment:
    /*
    const provider = new ethers.JsonRpcProvider("https://forno.celo.org");

    // Create contract instances
    const brokerContract = new ethers.Contract(
      BROKER_ADDRESS,
      ABIS.BROKER_PROVIDERS,
      provider
    );

    // Get exchange providers
    const exchangeProviders = await brokerContract.getExchangeProviders();

    // Find the exchange for cUSD/cEUR and cUSD/cREAL
    const rates = {
      cUSD: "1.0", // cUSD is always 1:1 with USD
      cEUR: "1.1", // Default fallback
      cREAL: "0.2"  // Default fallback
    };

    // Implementation would continue here...

    return rates;
    */
  } catch (error) {
    console.error('Error getting stablecoin rates:', error);
    return {
      cUSD: '1.0',
      cEUR: '1.1',
      cREAL: '0.2',
    };
  }
}
