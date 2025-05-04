import React from "react";

// Define region metadata
const REGION_METADATA = {
  Africa: {
    color: "#F56565", // red-500
    tokens: ["cKES", "cGHS", "eXOF", "cUSD"],
    inflationRate: 11.2,
    volatility: "High",
    growthPotential: "High",
  },
  LatAm: {
    color: "#F6AD55", // orange-400
    tokens: ["cREAL", "cCOP"],
    inflationRate: 5.9,
    volatility: "Medium",
    growthPotential: "Medium",
  },
  Asia: {
    color: "#9F7AEA", // purple-400
    tokens: ["PUSO"],
    inflationRate: 3.9,
    volatility: "Medium",
    growthPotential: "High",
  },
  Europe: {
    color: "#48BB78", // green-500
    tokens: ["cEUR"],
    inflationRate: 2.4,
    volatility: "Low",
    growthPotential: "Low",
  },
  USA: {
    color: "#4299E1", // blue-500
    tokens: ["cUSD"],
    inflationRate: 3.1,
    volatility: "Low",
    growthPotential: "Medium",
  },
};

// Portfolio allocation strategies
const PORTFOLIO_STRATEGIES = {
  conservative: {
    name: "Conservative",
    description: "Focus on stability with lower-inflation regions",
    allocations: {
      USA: 0.4,
      Europe: 0.3,
      Asia: 0.1,
      LatAm: 0.1,
      Africa: 0.1,
    },
  },
  balanced: {
    name: "Balanced",
    description: "Mix of stability and growth potential",
    allocations: {
      USA: 0.3,
      Europe: 0.2,
      Asia: 0.2,
      LatAm: 0.15,
      Africa: 0.15,
    },
  },
  growth: {
    name: "Growth",
    description: "Higher exposure to emerging markets",
    allocations: {
      USA: 0.2,
      Europe: 0.15,
      Asia: 0.25,
      LatAm: 0.2,
      Africa: 0.2,
    },
  },
  inflationHedge: {
    name: "Inflation Hedge",
    description: "Optimized for inflation protection",
    allocations: {
      USA: 0.25,
      Europe: 0.25,
      Asia: 0.2,
      LatAm: 0.15,
      Africa: 0.15,
    },
  },
};

// Calculate potential allocation adjustments based on current portfolio and target allocation
const calculatePotentialAdjustments = (
  currentAllocations: Record<string, number>,
  targetStrategy: keyof typeof PORTFOLIO_STRATEGIES
) => {
  const targetAllocations = PORTFOLIO_STRATEGIES[targetStrategy].allocations;
  const swaps: Array<{ from: string; to: string; percentage: number }> = [];

  // Find regions that are overallocated
  const overallocated = Object.entries(currentAllocations)
    .filter(([region, allocation]) => {
      const targetAllocation =
        targetAllocations[region as keyof typeof targetAllocations] || 0;
      return allocation > targetAllocation;
    })
    .sort(
      (a, b) =>
        b[1] -
        targetAllocations[b[0] as keyof typeof targetAllocations] -
        (a[1] - targetAllocations[a[0] as keyof typeof targetAllocations])
    );

  // Find regions that are underallocated
  const underallocated = Object.entries(targetAllocations)
    .filter(([region, targetAllocation]) => {
      const currentAllocation = currentAllocations[region] || 0;
      return currentAllocation < targetAllocation;
    })
    .sort(
      (a, b) =>
        b[1] -
        (currentAllocations[b[0]] || 0) -
        (a[1] - (currentAllocations[a[0]] || 0))
    );

  // Create potential adjustment suggestions
  let overIdx = 0;
  let underIdx = 0;

  while (overIdx < overallocated.length && underIdx < underallocated.length) {
    const [overRegion, overAmount] = overallocated[overIdx];
    const [underRegion, underTarget] = underallocated[underIdx];

    const currentUnderAmount = currentAllocations[underRegion] || 0;
    const neededAmount = underTarget - currentUnderAmount;
    const availableAmount =
      overAmount -
      targetAllocations[overRegion as keyof typeof targetAllocations];

    const swapAmount = Math.min(neededAmount, availableAmount);

    if (swapAmount > 0.05) {
      // Only suggest swaps that are significant (>5%)
      swaps.push({
        from: overRegion,
        to: underRegion,
        percentage: Math.round(swapAmount * 100),
      });
    }

    // Update the allocation amounts for next iteration
    overallocated[overIdx][1] -= swapAmount;
    if (
      overallocated[overIdx][1] <=
      targetAllocations[overRegion as keyof typeof targetAllocations] + 0.01
    ) {
      overIdx++;
    }

    const updatedUnderAmount = currentUnderAmount + swapAmount;
    if (updatedUnderAmount >= underTarget - 0.01) {
      underIdx++;
    }
  }

  return swaps;
};

interface PortfolioRecommendationsProps {
  currentAllocations: Record<string, number>;
  onSelectStrategy?: (strategy: keyof typeof PORTFOLIO_STRATEGIES) => void;
}

export default function PortfolioRecommendations({
  currentAllocations,
  onSelectStrategy,
}: PortfolioRecommendationsProps) {
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<keyof typeof PORTFOLIO_STRATEGIES>("balanced");

  // Calculate potential adjustments
  const potentialAdjustments = calculatePotentialAdjustments(
    currentAllocations,
    selectedStrategy
  );

  // Handle strategy selection
  const handleStrategyChange = (
    strategy: keyof typeof PORTFOLIO_STRATEGIES
  ) => {
    setSelectedStrategy(strategy);
    if (onSelectStrategy) {
      onSelectStrategy(strategy);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Portfolio Strategies</h2>
        <span className="text-xs text-gray-500">
          Analysis: World Bank, Alpha Vantage
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 mb-4">
          Explore different portfolio strategies and see how they compare to
          your current allocation.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {Object.entries(PORTFOLIO_STRATEGIES).map(([key, strategy]) => (
            <button
              key={key}
              onClick={() =>
                handleStrategyChange(key as keyof typeof PORTFOLIO_STRATEGIES)
              }
              className={`p-2 text-sm rounded-md transition-colors ${
                selectedStrategy === key
                  ? "bg-blue-100 border-blue-300 border text-blue-700"
                  : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="font-medium">{strategy.name}</div>
              <div className="text-xs mt-1">{strategy.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-medium mb-2">Strategy Allocation</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex mb-2">
            {Object.entries(
              PORTFOLIO_STRATEGIES[selectedStrategy].allocations
            ).map(([region, allocation]) => (
              <div
                key={region}
                className="h-6"
                style={{
                  width: `${allocation * 100}%`,
                  backgroundColor:
                    REGION_METADATA[region as keyof typeof REGION_METADATA]
                      ?.color || "#CBD5E0",
                }}
                title={`${region}: ${(allocation * 100).toFixed(0)}%`}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {Object.entries(
              PORTFOLIO_STRATEGIES[selectedStrategy].allocations
            ).map(([region, allocation]) => (
              <div key={region} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{
                    backgroundColor:
                      REGION_METADATA[region as keyof typeof REGION_METADATA]
                        ?.color || "#CBD5E0",
                  }}
                />
                <span>
                  {region}: {(allocation * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {potentialAdjustments.length > 0 ? (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Potential Adjustments</h3>
          <div className="space-y-2">
            {potentialAdjustments.map((swap, index) => (
              <div key={index} className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          REGION_METADATA[
                            swap.from as keyof typeof REGION_METADATA
                          ]?.color || "#CBD5E0",
                      }}
                    />
                    <span>{swap.from}</span>
                  </div>
                  <div className="mx-2">→</div>
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          REGION_METADATA[
                            swap.to as keyof typeof REGION_METADATA
                          ]?.color || "#CBD5E0",
                      }}
                    />
                    <span>{swap.to}</span>
                  </div>
                  <div className="ml-auto font-medium">{swap.percentage}%</div>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Moving {swap.percentage}% from {swap.from} to {swap.to} would
                  align with the {PORTFOLIO_STRATEGIES[selectedStrategy].name}{" "}
                  strategy.
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 p-3 rounded-md mb-4">
          <p className="text-sm text-green-600">
            Your current portfolio is already similar to the{" "}
            {PORTFOLIO_STRATEGIES[selectedStrategy].name} strategy.
          </p>
        </div>
      )}

      <div className="bg-yellow-50 p-3 rounded-md">
        <h3 className="font-medium text-yellow-700 mb-1">Strategy Benefits</h3>
        <ul className="text-sm text-yellow-600 list-disc pl-5 space-y-1">
          <li>Reduce exposure to high-inflation regions</li>
          <li>Maintain purchasing power across different economies</li>
          <li>Protect against currency devaluation in any single region</li>
          <li>Create a more resilient savings portfolio</li>
        </ul>
      </div>
    </div>
  );
}
