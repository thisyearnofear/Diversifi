console.log('Applying Mento SDK patch...');

(Mento.prototype as any).getSupportedTokens = async function () {
  const pairs = await this.getTradablePairs();
  const supportedTokens = new Map<string, { address: string; symbol: string }>();
  pairs.forEach((pair: any) => {
    pair.forEach((token: any) => {
      if (!supportedTokens.has(token.address)) {
        supportedTokens.set(token.address, token);
      }
    });
  });
  return Array.from(supportedTokens.values());
};