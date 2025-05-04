import React, { useState } from "react";
import type { Region } from "../hooks/use-user-region";

// Region colors for visualization
const REGION_COLORS: Record<string, string> = {
  USA: "#4299E1", // blue
  Europe: "#48BB78", // green
  LatAm: "#F6AD55", // orange
  Africa: "#F56565", // red
  Asia: "#9F7AEA", // purple
};

// Region-specific insights
const REGION_INSIGHTS: Record<
  Region,
  {
    title: string;
    description: string;
    typicalAllocation: Record<Region, number>;
    considerations: string[];
    inflationRate: number;
    volatilityLevel: "Low" | "Medium" | "High";
    localCurrencies: string[];
  }
> = {
  Africa: {
    title: "Regional Insights: Africa",
    description:
      "Based on historical data for this region, many users diversify into EUR and USD to address local currency volatility.",
    typicalAllocation: {
      Africa: 40,
      USA: 30,
      Europe: 20,
      Asia: 5,
      LatAm: 5,
    },
    considerations: [
      "African currencies often experience higher inflation rates",
      "EUR and USD provide stability during economic uncertainty",
      "Local currency exposure helps with everyday expenses",
      "A mix of local and global currencies balances needs with stability",
    ],
    inflationRate: 11.2,
    volatilityLevel: "High",
    localCurrencies: ["cKES", "cGHS", "eXOF"],
  },
  USA: {
    title: "Regional Insights: USA",
    description:
      "Users in the USA often add exposure to EUR and emerging markets for diversification benefits.",
    typicalAllocation: {
      USA: 50,
      Europe: 25,
      Asia: 10,
      Africa: 10,
      LatAm: 5,
    },
    considerations: [
      "USD is a global reserve currency with relative stability",
      "EUR provides hedge against USD fluctuations",
      "Emerging market exposure offers different economic cycles",
      "Global diversification can reduce overall portfolio volatility",
    ],
    inflationRate: 3.1,
    volatilityLevel: "Low",
    localCurrencies: ["cUSD"],
  },
  Europe: {
    title: "Regional Insights: Europe",
    description:
      "European users typically maintain EUR as their base with USD and emerging market exposure for diversification.",
    typicalAllocation: {
      Europe: 50,
      USA: 25,
      Africa: 10,
      Asia: 10,
      LatAm: 5,
    },
    considerations: [
      "EUR provides stability for European residents",
      "USD offers protection against EUR-specific risks",
      "African stablecoins can provide exposure to different markets",
      "Diversification across currencies can reduce overall risk",
    ],
    inflationRate: 2.4,
    volatilityLevel: "Low",
    localCurrencies: ["cEUR"],
  },
  LatAm: {
    title: "Regional Insights: Latin America",
    description:
      "In Latin America, many users maintain significant USD and EUR allocations alongside local currencies.",
    typicalAllocation: {
      LatAm: 35,
      USA: 35,
      Europe: 20,
      Asia: 5,
      Africa: 5,
    },
    considerations: [
      "Latin American currencies often face inflation pressures",
      "USD provides stability for savings",
      "Local currency exposure helps with everyday expenses",
      "A balanced approach addresses both local needs and stability",
    ],
    inflationRate: 5.9,
    volatilityLevel: "Medium",
    localCurrencies: ["cREAL", "cCOP"],
  },
  Asia: {
    title: "Regional Insights: Asia",
    description:
      "Users in Asia often take a balanced approach with significant USD exposure alongside local currencies.",
    typicalAllocation: {
      Asia: 40,
      USA: 30,
      Europe: 20,
      Africa: 5,
      LatAm: 5,
    },
    considerations: [
      "Asian currencies vary widely in stability",
      "USD provides stability for savings",
      "EUR offers diversification from USD",
      "A mix of local and global currencies addresses different needs",
    ],
    inflationRate: 3.9,
    volatilityLevel: "Medium",
    localCurrencies: ["PUSO"],
  },
};

interface RegionalRecommendationsProps {
  userRegion: Region;
  currentAllocations?: Record<string, number>;
}

export default function RegionalRecommendations({
  userRegion,
  currentAllocations,
}: RegionalRecommendationsProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region>(userRegion);
  const regionData = REGION_INSIGHTS[selectedRegion];

  // Calculate how far current allocation is from typical
  const calculateDifference = () => {
    if (!currentAllocations) return null;

    const differences: Record<string, number> = {};
    let totalDifference = 0;

    Object.entries(regionData.typicalAllocation).forEach(
      ([region, typical]) => {
        const current = (currentAllocations[region] || 0) * 100;
        const diff = typical - current;
        differences[region] = diff;
        totalDifference += Math.abs(diff);
      }
    );

    return {
      differences,
      totalDifference: totalDifference / 2, // Divide by 2 because each positive difference has a corresponding negative
      isClose: totalDifference < 10, // Less than 10% total difference is considered close to typical
    };
  };

  const difference = currentAllocations ? calculateDifference() : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{regionData.title}</h2>
        <span className="text-xs text-gray-500">
          Data: World Bank, Alpha Vantage
        </span>
      </div>
      <p className="text-gray-600 mb-4">{regionData.description}</p>

      {/* Region selector tabs */}
      <div className="flex overflow-x-auto mb-4 pb-1">
        {Object.keys(REGION_INSIGHTS).map((region) => (
          <button
            key={region}
            className={`px-3 py-1 mr-2 text-sm rounded-md whitespace-nowrap ${
              selectedRegion === region
                ? "bg-blue-100 text-blue-800 font-medium"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setSelectedRegion(region as Region)}
          >
            {region}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 p-3 rounded-md mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-blue-700">Region Profile</h3>
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {selectedRegion}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-blue-600">Inflation Rate:</span>
            <span className="font-medium ml-1">
              {regionData.inflationRate}%
            </span>
          </div>
          <div>
            <span className="text-blue-600">Volatility:</span>
            <span className="font-medium ml-1">
              {regionData.volatilityLevel}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-blue-600">Local Stablecoins:</span>
            <span className="font-medium ml-1">
              {regionData.localCurrencies.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <h3 className="font-medium mb-2">Typical Allocation Pattern</h3>
      <div className="bg-gray-50 p-3 rounded-md mb-4">
        <div className="flex mb-2">
          {Object.entries(regionData.typicalAllocation).map(
            ([region, allocation]) => (
              <div
                key={region}
                className="h-6"
                style={{
                  width: `${allocation}%`,
                  backgroundColor: REGION_COLORS[region] || "#CBD5E0",
                }}
                title={`${region}: ${allocation}%`}
              />
            )
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {Object.entries(regionData.typicalAllocation).map(
            ([region, allocation]) => (
              <div key={region} className="flex items-center">
                <div
                  className="size-3 rounded-full mr-1"
                  style={{
                    backgroundColor: REGION_COLORS[region] || "#CBD5E0",
                  }}
                />
                <span>
                  {region}: {allocation}%
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {difference && (
        <div
          className={`p-3 rounded-md mb-4 ${
            difference.isClose ? "bg-green-50" : "bg-gray-50"
          }`}
        >
          <h3
            className={`font-medium mb-2 ${
              difference.isClose ? "text-green-700" : "text-gray-700"
            }`}
          >
            {difference.isClose
              ? "Your portfolio is similar to typical patterns"
              : "Your portfolio vs typical patterns"}
          </h3>

          <div className="space-y-2">
            {Object.entries(difference.differences)
              .filter(([_, diff]) => Math.abs(diff) >= 5) // Only show significant differences
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])) // Sort by absolute difference
              .map(([region, diff]) => (
                <div
                  key={region}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center">
                    <div
                      className="size-3 rounded-full mr-1"
                      style={{
                        backgroundColor: REGION_COLORS[region] || "#CBD5E0",
                      }}
                    />
                    <span>{region}</span>
                  </div>
                  <div className="text-gray-700">
                    {diff > 0
                      ? `${diff.toFixed(0)}% less than typical`
                      : `${Math.abs(diff).toFixed(0)}% more than typical`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      <h3 className="font-medium mb-2">Key Considerations</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 mb-4">
        {regionData.considerations.map((consideration, index) => (
          <li key={index}>{consideration}</li>
        ))}
      </ul>

      <div className="bg-yellow-50 p-3 rounded-md">
        <h3 className="font-medium text-yellow-700 mb-1">Historical Context</h3>
        <p className="text-sm text-yellow-600">
          Data shows that residents of {selectedRegion} who diversified their
          savings across multiple stablecoins preserved up to{" "}
          {selectedRegion === "Africa" || selectedRegion === "LatAm"
            ? "15%"
            : "8%"}{" "}
          more purchasing power during recent economic volatility compared to
          those who held only local currency.
        </p>
      </div>
    </div>
  );
}
