import React from "react";
import SimplePieChart from "@/components/SimplePieChart";
import { useDiversification } from "@/hooks/use-diversification";
import { REGION_COLORS } from "@/constants/regions";
import type { Region } from "@/hooks/use-user-region";

interface OverviewTabProps {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  isInMiniPay: boolean;
  formatAddress: (addr: string) => string;
  chainId: number | null;
  regionData: Array<{ region: string; value: number; color: string }>;
  regionTotals: Record<string, number>;
  totalValue: number;
  isRegionLoading: boolean;
  userRegion: Region;
  setUserRegion: (region: Region) => void;
  REGIONS: readonly Region[];
  isBalancesLoading: boolean;
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({
  address,
  isConnecting,
  error,
  connectWallet,
  isInMiniPay,
  formatAddress,
  chainId,
  regionData,
  regionTotals,
  totalValue,
  isRegionLoading,
  userRegion,
  setUserRegion,
  REGIONS,
  isBalancesLoading,
  setActiveTab,
}: OverviewTabProps) {
  const {
    diversificationScore,
    diversificationRating,
    diversificationDescription,
    diversificationTips,
  } = useDiversification(regionData, userRegion);

  return (
    <div className="space-y-4">
      {!address && !isConnecting && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Protect Your Savings</h2>
          <p className="mb-6 text-gray-600">
            Diversify your stablecoins across regions to hedge against inflation
          </p>
          {isInMiniPay ? (
            <div className="bg-yellow-50 p-3 rounded-md mb-4 text-yellow-700">
              MiniPay detected. Connecting automatically...
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}

      {isConnecting && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="mt-2">Connecting to your wallet...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {address && (
        <>
          <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Portfolio Overview</h2>
              <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {chainId === 44787
                  ? "Celo Alfajores"
                  : chainId === 42220
                  ? "Celo Mainnet"
                  : chainId
                  ? `Chain ID: ${chainId}`
                  : "Unknown"}
              </div>
            </div>

            {Object.keys(regionTotals).length === 0 ? (
              // Empty state when no stablecoins are found
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  No Stablecoins Found
                </h3>
                <p className="text-gray-600 mb-4">
                  You don't have any stablecoins in your wallet yet.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-medium text-blue-700 mb-2">
                    Get Started with Stablecoins
                  </h4>
                  <ul className="text-sm text-blue-600 space-y-2">
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 text-blue-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>
                        Swap to cUSD, cEUR, or other regional stablecoins
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 text-blue-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>
                        Diversify across regions to protect against inflation
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4 text-blue-500 mr-2 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>Track your portfolio's geographic exposure</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setActiveTab("swap")}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Go to Swap
                </button>
              </div>
            ) : (
              // Normal state when stablecoins are found
              <>
                <div className="flex flex-col md:flex-row items-center mb-4">
                  <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <SimplePieChart
                      data={regionData}
                      title="Regional Exposure"
                    />
                  </div>
                  <div className="w-full md:w-1/2 pl-0 md:pl-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="text-3xl font-bold text-blue-600">
                          {diversificationScore}
                        </div>
                        <div className="text-sm ml-2 text-gray-500">/100</div>
                      </div>
                      <div className="text-lg font-medium mb-1">
                        {diversificationRating} Diversification
                      </div>
                      <div className="text-sm text-gray-600">
                        {diversificationDescription}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-500 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm font-medium">Recommendations</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-md">
                    <ul className="text-sm space-y-2">
                      {diversificationTips.slice(0, 2).map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="size-4 text-blue-500 mr-2 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {Object.keys(regionTotals).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
              <h2 className="text-lg font-semibold mb-4">Regional Exposure</h2>

              <div className="space-y-4">
                {Object.entries(regionTotals).map(([region, value]) => (
                  <div key={region} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              REGION_COLORS[
                                region as keyof typeof REGION_COLORS
                              ] || "#CBD5E0",
                          }}
                        />
                        <span className="font-medium">{region}</span>
                      </div>
                      <div className="font-medium">${value.toFixed(2)}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${(value / (totalValue || 1)) * 100}%`,
                          backgroundColor:
                            REGION_COLORS[
                              region as keyof typeof REGION_COLORS
                            ] || "#CBD5E0",
                        }}
                      />
                    </div>
                    <div className="text-xs text-right mt-1 text-gray-500">
                      {((value / (totalValue || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Region</h2>
              <div className="text-sm text-gray-500">
                {isRegionLoading ? "Detecting..." : ""}
              </div>
            </div>

            <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
              <div
                className="w-10 h-10 rounded-full mr-3 flex items-center justify-center text-white font-bold"
                style={{
                  backgroundColor:
                    REGION_COLORS[userRegion as keyof typeof REGION_COLORS] ||
                    "#CBD5E0",
                }}
              >
                {userRegion.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{userRegion}</div>
                <div className="text-xs text-gray-500">Current region</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Change Region</div>
              <div className="grid grid-cols-3 gap-2">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    onClick={() => setUserRegion(region)}
                    className={`p-2 rounded-md transition-colors ${
                      userRegion === region
                        ? "bg-blue-100 border-blue-300 border text-blue-700"
                        : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{region}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
