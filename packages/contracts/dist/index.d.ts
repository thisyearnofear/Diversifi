declare const STABLECOIN_ADDRESSES: {
    readonly cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a";
    readonly cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73";
    readonly cREAL: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787";
};
type CeloStablecoin = keyof typeof STABLECOIN_ADDRESSES;
/**
 * Get balance of a specific Celo stablecoin for an address
 */
declare function getStablecoinBalance(address: string, token: CeloStablecoin): Promise<any>;
/**
 * Get all Celo stablecoin balances for an address
 */
declare function getAllStablecoinBalances(address: string): Promise<{
    cUSD: string;
    cEUR: string;
    cREAL: string;
}>;
/**
 * Get exchange rates for Celo stablecoins
 */
declare function getStablecoinRates(): Promise<{
    cUSD: string;
    cEUR: string;
    cREAL: string;
}>;

export { type CeloStablecoin, getAllStablecoinBalances, getStablecoinBalance, getStablecoinRates };
