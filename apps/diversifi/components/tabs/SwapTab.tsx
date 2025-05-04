import React from "react";
import SwapInterface from "@/components/SwapInterface";
import { useInflationData } from "@/hooks/use-inflation-data";
import type { Region } from "@/hooks/use-user-region";

interface SwapTabProps {
  address: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  isInMiniPay: boolean;
  availableTokens: Array<{
    symbol: string;
    name: string;
    region: string;
  }>;
  userRegion: Region;
  selectedStrategy: string;
  inflationData: any;
}

export default function SwapTab({
  address,
  isConnecting,
  connectWallet,
  isInMiniPay,
  availableTokens,
  userRegion,
  selectedStrategy,
  inflationData,
}: SwapTabProps) {
  const { dataSource: inflationDataSource } = useInflationData();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Swap Stablecoins</h2>
        <p className="text-gray-600 mb-4">
          Swap between different regional stablecoins to optimize your
          portfolio.
        </p>

        {!address && !isConnecting ? (
          <div className="bg-yellow-50 p-3 rounded-md mb-4">
            <p className="text-yellow-700">
              Connect your wallet to swap stablecoins.
            </p>

            {!isInMiniPay && (
              <button
                onClick={connectWallet}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Show inflation comparison for the currencies */}
            <div className="bg-blue-50 p-3 rounded-md mb-4">
              <h3 className="font-medium text-blue-700 mb-2">
                Inflation Protection Impact
              </h3>
              <p className="text-sm text-blue-600 mb-2">
                Diversifying your stablecoins can protect your savings from
                inflation.
                {inflationDataSource === "api" && (
                  <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded-full">
                    Live Data
                  </span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {Object.entries(inflationData).map(
                  ([region, data]: [string, any]) => (
                    <div
                      key={region}
                      className="p-2 rounded-md border border-gray-200 bg-white"
                    >
                      <div className="font-medium">{region}</div>
                      <div className="text-sm">
                        Inflation:{" "}
                        <span className="font-bold">
                          {data.avgRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <SwapInterface
              availableTokens={availableTokens}
              address={address}
              onSwap={async (fromToken, toToken, amount) => {
                console.log(`Swapping ${amount} ${fromToken} to ${toToken}`);
                // The SwapInterface component now handles the swap internally
                // This onSwap function is just for logging and any additional actions
                // like refreshing balances after the swap

                // Wait a bit to simulate the swap
                await new Promise((resolve) => setTimeout(resolve, 2000));

                // Refresh balances after swap (if we had a refresh function)
                // if (refreshBalances) refreshBalances();

                return Promise.resolve();
              }}
            />
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-700 mb-2">Swap Recommendations</h3>
        <p className="text-sm text-blue-600 mb-3">
          Based on your selected strategy ({selectedStrategy}), consider these
          swaps:
        </p>

        <div className="space-y-2">
          {userRegion === "Africa" && (
            <div className="bg-white p-2 rounded border border-blue-100">
              <p className="text-sm">
                Swap some <strong>cKES</strong> to <strong>cEUR</strong> to
                reduce exposure to high inflation regions.
              </p>
            </div>
          )}

          {userRegion === "LatAm" && (
            <div className="bg-white p-2 rounded border border-blue-100">
              <p className="text-sm">
                Swap some <strong>cCOP</strong> to <strong>cUSD</strong> to
                balance your portfolio.
              </p>
            </div>
          )}

          {userRegion === "USA" && (
            <div className="bg-white p-2 rounded border border-blue-100">
              <p className="text-sm">
                Swap some <strong>cUSD</strong> to <strong>cEUR</strong> for
                better geographic diversification.
              </p>
            </div>
          )}

          {userRegion === "Europe" && (
            <div className="bg-white p-2 rounded border border-blue-100">
              <p className="text-sm">
                Swap some <strong>cEUR</strong> to <strong>cKES</strong> for
                exposure to high-growth regions.
              </p>
            </div>
          )}

          {userRegion === "Asia" && (
            <div className="bg-white p-2 rounded border border-blue-100">
              <p className="text-sm">
                Swap some <strong>PUSO</strong> to <strong>cUSD</strong> for
                more stability in your portfolio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
