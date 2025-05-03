export type CeloStablecoin = 'cUSD' | 'cEUR' | 'cREAL';

export function getStablecoinBalance(
  address: string,
  token: CeloStablecoin,
): Promise<string>;
export function getAllStablecoinBalances(
  address: string,
): Promise<Record<CeloStablecoin, string>>;
export function getStablecoinRates(): Promise<Record<CeloStablecoin, string>>;
