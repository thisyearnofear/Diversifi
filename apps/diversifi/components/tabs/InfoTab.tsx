import React from "react";
import { REGION_COLORS } from "../../constants/regions";

interface InfoTabProps {
  availableTokens: Array<{
    symbol: string;
    name: string;
    region: string;
  }>;
  isInMiniPay: boolean;
  chainId: number | null;
  address: string | null;
  formatAddress: (addr: string) => string;
}

export default function InfoTab({
  availableTokens,
  isInMiniPay,
  chainId,
  address,
  formatAddress,
}: InfoTabProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">About DiversiFi</h2>
        <p className="text-gray-600 mb-4">
          DiversiFi helps you protect your savings from inflation by
          diversifying your stablecoin portfolio across different regions.
        </p>

        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <h3 className="font-medium text-blue-700 mb-1">
            Why Diversify Stablecoins?
          </h3>
          <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
            <li>Protect against inflation in your local currency</li>
            <li>Reduce risk from any single region's economic issues</li>
            <li>Maintain purchasing power across different economies</li>
            <li>Create a more resilient savings portfolio</li>
          </ul>
        </div>

        <div className="bg-green-50 p-3 rounded-md">
          <h3 className="font-medium text-green-700 mb-1">How It Works</h3>
          <ol className="text-sm text-green-600 list-decimal pl-5 space-y-1">
            <li>Connect your MiniPay wallet</li>
            <li>View your current stablecoin portfolio</li>
            <li>See personalized recommendations based on your home region</li>
            <li>Swap stablecoins to optimize your portfolio</li>
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Supported Stablecoins</h2>

        <div className="grid grid-cols-2 gap-2">
          {availableTokens.map((token) => (
            <div
              key={token.symbol}
              className="p-2 rounded-md border border-gray-200"
              style={{
                borderLeftColor:
                  REGION_COLORS[token.region as keyof typeof REGION_COLORS],
                borderLeftWidth: "4px",
              }}
            >
              <div className="font-medium">{token.symbol}</div>
              <div className="text-xs text-gray-500">{token.name}</div>
              <div className="text-xs mt-1">
                <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-full">
                  {token.region}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-2">Technical Details</h2>
        <p className="text-gray-600 mb-4">
          This app is optimized for MiniPay and works with Celo and Celo
          Alfajores Testnet.
        </p>

        <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700">
          <div>
            <strong>Is MiniPay:</strong> {isInMiniPay ? "Yes" : "No"}
          </div>
          <div>
            <strong>Chain ID:</strong> {chainId ? chainId.toString() : "N/A"}
            {chainId === 44787 && " (Celo Alfajores Testnet)"}
            {chainId === 42220 && " (Celo Mainnet)"}
          </div>
          <div>
            <strong>Has Ethereum Provider:</strong>{" "}
            {typeof window !== "undefined" && window.ethereum ? "Yes" : "No"}
          </div>
          <div>
            <strong>Connected Address:</strong>{" "}
            {address ? formatAddress(address) : "Not connected"}
          </div>
        </div>
      </div>
    </div>
  );
}
