import React, { useState } from "react";
import { useInflationData } from "../hooks/use-inflation-data";
import type { Region } from "../hooks/use-user-region";

// Calculate potential savings from diversification
const calculateSavings = (
  amount: number,
  homeRegion: Region,
  diversifiedRegions: Array<Region>,
  inflationData: any
): number => {
  if (!diversifiedRegions.length) return 0;

  const homeInflation = inflationData[homeRegion]?.avgRate || 0;

  // Calculate average inflation rate of diversified portfolio
  const totalInflation = diversifiedRegions.reduce((sum, region) => {
    if (inflationData[region]) {
      return sum + inflationData[region].avgRate;
    }
    return sum + homeInflation;
  }, 0);

  const avgDiversifiedInflation = totalInflation / diversifiedRegions.length;

  // If diversified inflation is higher than home, return 0 (no savings)
  if (avgDiversifiedInflation >= homeInflation) return 0;

  // Calculate savings as the difference in purchasing power after 1 year
  const homeValueAfterYear = amount * (1 - homeInflation / 100);
  const diversifiedValueAfterYear =
    amount * (1 - avgDiversifiedInflation / 100);

  return diversifiedValueAfterYear - homeValueAfterYear;
};

interface InflationProtectionInfoProps {
  homeRegion?: Region;
  currentRegions?: Array<Region>;
  amount?: number;
  onChangeHomeRegion?: (region: Region) => void;
}

export default function InflationProtectionInfo({
  homeRegion = "Africa",
  currentRegions = [],
  amount = 1000,
  onChangeHomeRegion,
}: InflationProtectionInfoProps) {
  // Use our custom hook to get real inflation data
  const { inflationData, dataSource } = useInflationData();
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Calculate potential savings
  const savings = calculateSavings(
    amount,
    homeRegion,
    currentRegions,
    inflationData
  );

  // Get home region inflation rate
  const homeInflationRate = inflationData[homeRegion]?.avgRate || 0;

  // Calculate average inflation rate of current portfolio
  const avgPortfolioInflation = currentRegions.length
    ? currentRegions.reduce((sum, region) => {
        if (inflationData[region]) {
          return sum + inflationData[region].avgRate;
        }
        return sum + homeInflationRate;
      }, 0) / currentRegions.length
    : homeInflationRate;

  // Get region-specific insights
  const getRegionInsights = (region: Region) => {
    const data = inflationData[region];
    if (!data) return null;

    return {
      inflationRate: data.avgRate,
      stablecoins: data.stablecoins,
      comparisonToHome: data.avgRate - homeInflationRate,
    };
  };

  // Get insights for selected region or home region
  const regionInsights = selectedRegion
    ? getRegionInsights(selectedRegion)
    : getRegionInsights(homeRegion);

  // Handle changing home region
  const handleChangeHomeRegion = (region: Region) => {
    if (onChangeHomeRegion) {
      onChangeHomeRegion(region);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Inflation Protection</h2>
        <div className="flex items-center">
          {dataSource === "api" && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Live Data
            </span>
          )}
          {dataSource === "cache" && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Cached Data
            </span>
          )}
        </div>
      </div>

      {/* Home Region Selector */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Choose Home Region</h3>
          <span className="text-xs text-gray-500">Data from World Bank</span>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-3">
          {Object.keys(inflationData).map((region) => (
            <button
              key={region}
              className={`p-1 text-xs rounded-md transition-colors ${
                region === homeRegion
                  ? "bg-blue-100 border-blue-300 border text-blue-700 font-medium"
                  : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => onChangeHomeRegion?.(region as Region)}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-700 font-medium">
                {homeRegion} inflation:{" "}
                <span className="font-bold">
                  {homeInflationRate.toFixed(1)}%
                </span>
              </p>
              {currentRegions.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  Portfolio avg:{" "}
                  <span className="font-bold">
                    {avgPortfolioInflation.toFixed(1)}%
                  </span>
                  {avgPortfolioInflation < homeInflationRate && (
                    <span className="ml-1 text-green-600">
                      ({(homeInflationRate - avgPortfolioInflation).toFixed(1)}%
                      better)
                    </span>
                  )}
                </p>
              )}
            </div>
            {savings > 0 && (
              <div className="text-right">
                <p className="text-xs text-green-600 font-medium">
                  Potential savings:
                </p>
                <p className="text-sm text-green-700 font-bold">
                  ${savings.toFixed(2)}/yr
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regional Inflation Rates */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Choose Insights</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(inflationData).map(
            ([region, data]: [string, any]) => (
              <div
                key={region}
                className={`p-2 rounded-md border cursor-pointer transition-colors ${
                  region === homeRegion
                    ? "border-blue-300 bg-blue-50"
                    : currentRegions.includes(region as Region)
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${selectedRegion === region ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => setSelectedRegion(region as Region)}
              >
                <div className="font-medium">{region}</div>
                <div className="text-sm">
                  Inflation:{" "}
                  <span className="font-bold">{data.avgRate.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.stablecoins.join(", ")}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Region Insights */}
      {selectedRegion && regionInsights && (
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">{selectedRegion} Insights</h3>
            <button
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => setSelectedRegion(null)}
            >
              Close
            </button>
          </div>
          <div className="text-sm space-y-2">
            <p>
              Inflation rate:{" "}
              <span className="font-medium">
                {regionInsights.inflationRate.toFixed(1)}%
              </span>
              {regionInsights.comparisonToHome < 0 && (
                <span className="text-green-600 ml-1">
                  ({Math.abs(regionInsights.comparisonToHome).toFixed(1)}% lower
                  than {homeRegion})
                </span>
              )}
              {regionInsights.comparisonToHome > 0 && (
                <span className="text-red-600 ml-1">
                  ({regionInsights.comparisonToHome.toFixed(1)}% higher than{" "}
                  {homeRegion})
                </span>
              )}
            </p>
            <p>
              Available stablecoins:{" "}
              <span className="font-medium">
                {regionInsights.stablecoins.join(", ")}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
        <span>Data sources: World Bank, Alpha Vantage</span>
        <span>Updated daily</span>
      </div>
    </div>
  );
}
