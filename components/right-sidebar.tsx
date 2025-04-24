"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Coins,
  Banknote,
  DollarSign,
  Euro,
  Gem,
  MessageCircle,
  Loader2,
  User,
} from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useRegion, type Region } from "@/contexts/region-context";
import { Badge } from "@/components/ui/badge";
import { getAvailableTokensByRegion } from "@/lib/tokens/token-data";
import { useTokenBalances, TOKEN_REGIONS } from "@/hooks/use-token-balances";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Region data with icons and colors
const regions: {
  id: Region;
  name: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: "All", name: "All Regions", icon: Globe, color: "text-blue-500" },
  { id: "Africa", name: "Africa", icon: MapPin, color: "text-green-500" },
  { id: "Europe", name: "Europe", icon: Euro, color: "text-blue-500" },
  { id: "USA", name: "USA", icon: DollarSign, color: "text-red-500" },
  {
    id: "LatAm",
    name: "Latin America",
    icon: Banknote,
    color: "text-yellow-500",
  },
  { id: "Asia", name: "Asia", icon: Coins, color: "text-purple-500" },
  { id: "RWA", name: "Real World Assets", icon: Gem, color: "text-amber-500" },
];

// Social links with icons and URLs
const socialLinks = [
  {
    name: "Farcaster",
    icon: MessageCircle,
    href: "https://warpcast.com/papa",
    color: "text-purple-500",
  },
  {
    name: "Lens",
    icon: Globe,
    href: "https://hey.xyz/u/papajams",
    color: "text-green-500",
  },
];

// Helper function to format balance for display
const formatBalance = (balance: string): string => {
  if (!balance || balance === "NaN") return "0.00";

  const num = parseFloat(balance);
  if (isNaN(num)) return "0.00";
  if (num === 0) return "0.00";

  // Handle very small values
  if (num < 0.01) {
    // For extremely small values (less than 0.0001), show scientific notation
    if (num < 0.0001) {
      return num.toExponential(2);
    }
    // For small values between 0.0001 and 0.01, show 4 decimal places
    return num.toFixed(4);
  }

  // For normal values, show 2 decimal places
  return num.toFixed(2);
};

// Helper function to format percentage
const formatPercentage = (amount: number, total: number): string => {
  if (total === 0 || amount === 0) return "0%";
  const percentage = (amount / total) * 100;
  if (percentage < 0.1) return "<0.1%";
  return `${percentage.toFixed(1)}%`;
};

// Helper functions for DiversiFi component
const getRegionColor = (region: string): string => {
  switch (region) {
    case "USA":
      return "bg-red-400 dark:bg-red-600";
    case "Europe":
      return "bg-blue-400 dark:bg-blue-600";
    case "Africa":
      return "bg-green-400 dark:bg-green-600";
    case "LatAm":
      return "bg-yellow-400 dark:bg-yellow-600";
    case "Asia":
      return "bg-purple-400 dark:bg-purple-600";
    case "RWA":
      return "bg-amber-400 dark:bg-amber-600";
    default:
      return "bg-gray-400 dark:bg-gray-600";
  }
};

// Calculate region totals from balances
const calculateRegionTotals = (
  balances: Record<
    string,
    { amount: string; value: number; loading: boolean; error: string | null }
  >
) => {
  const totals: Record<string, number> = {};
  let totalValue = 0;

  // Initialize all regions with 0
  Object.keys(TOKEN_REGIONS).forEach((region) => {
    if (region !== "All") {
      totals[region] = 0;
    }
  });

  // Calculate totals for each region
  Object.entries(TOKEN_REGIONS).forEach(([region, tokens]) => {
    if (region !== "All") {
      tokens.forEach((token) => {
        if (balances[token]) {
          totals[region] += balances[token].value;
          totalValue += balances[token].value;
        }
      });
    }
  });

  return { totals, totalValue };
};

// Simple DiversiScore component - no automatic calculation
function DiversiScore({
  score,
  hasData,
}: {
  score: number | null;
  hasData: boolean;
}) {
  return (
    <div className="relative mt-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded cursor-pointer">
              DiversiScore{hasData && score !== null ? `: ${score}/10` : ""}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p>Measure of geographic portfolio concentration</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function RightSidebar() {
  const isMobile = useIsMobile();
  const { selectedRegion, setSelectedRegion } = useRegion();

  // Get token balances - no automatic fetching
  const { balances, isLoading, refreshBalances } =
    useTokenBalances(selectedRegion);

  // State for balance visibility (hidden by default for privacy)
  // Use localStorage to persist the user's preference
  const [showBalances, setShowBalances] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("showBalances");
      return saved === "true";
    }
    return false; // Default to hidden
  });

  // State for DiversiScore
  const [diversiScore, setDiversiScore] = useState<number | null>(null);
  const [hasBalanceData, setHasBalanceData] = useState(false);

  // Update localStorage when preference changes
  const toggleBalanceVisibility = () => {
    const newValue = !showBalances;
    setShowBalances(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("showBalances", String(newValue));
    }
  };

  // No debug logging in production

  // Calculate DiversiScore manually when balances change
  useEffect(() => {
    if (!isLoading && Object.keys(balances).length > 0) {
      // Calculate region totals directly
      const { totals, totalValue } = calculateRegionTotals(balances);

      // Count regions with non-zero balances
      const activeRegionsCount = Object.values(totals).filter(
        (v) => v > 0
      ).length;

      // Check if we have any actual balance data
      const hasData = Object.values(totals).some((v) => v > 0);
      setHasBalanceData(hasData);

      if (hasData) {
        const score = Math.min(Math.ceil(activeRegionsCount * 1.7), 10);
        setDiversiScore(score);
      } else {
        setDiversiScore(null);
      }
    }
  }, [balances, isLoading]);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" side="right">
      <div className="pt-20">
        {" "}
        {/* Add padding to push content below wallet UI */}
        <SidebarContent>
          <div className="flex flex-col gap-3 p-3 max-w-[220px] mx-auto">
            {/* Region Selector - More Compact */}
            <div className="rounded-lg border p-3 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="size-4 text-blue-500 dark:text-blue-400" />
                <h3 className="font-medium text-sm">Region Selector</h3>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {regions.map((region) => {
                  // Get the count of available tokens for this region
                  const availableTokens = getAvailableTokensByRegion(region.id);
                  const availableCount = availableTokens.length;

                  return (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs p-1.5 rounded-md transition-colors",
                        selectedRegion === region.id
                          ? region.id === "Africa"
                            ? "bg-green-100 dark:bg-green-900/30 font-medium"
                            : region.id === "Europe"
                            ? "bg-blue-100 dark:bg-blue-900/30 font-medium"
                            : region.id === "USA"
                            ? "bg-red-100 dark:bg-red-900/30 font-medium"
                            : region.id === "LatAm"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 font-medium"
                            : region.id === "Asia"
                            ? "bg-purple-100 dark:bg-purple-900/30 font-medium"
                            : region.id === "RWA"
                            ? "bg-amber-100 dark:bg-amber-900/30 font-medium"
                            : "bg-blue-100 dark:bg-blue-900/30 font-medium"
                          : "hover:bg-muted"
                      )}
                      title={`${region.name} - ${availableCount} available tokens`}
                    >
                      <region.icon className={cn("size-3.5", region.color)} />
                      <span>{region.name}</span>
                      {availableCount > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1 py-0 h-4 ml-1",
                            selectedRegion === region.id
                              ? "bg-primary/20 border-primary/30"
                              : "bg-muted border-muted-foreground/20"
                          )}
                        >
                          {availableCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DiversiFi - Portfolio Diversification Teaser */}
            <div className="rounded-lg border p-4 bg-gradient-to-br from-zinc-50 to-gray-50 dark:from-zinc-900 dark:to-gray-900">
              <div className="flex flex-col items-center mb-3">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-blue-500" />
                  <h3 className="font-medium text-sm">Stables</h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRegion === "All" && (
                    <DiversiScore
                      score={diversiScore}
                      hasData={hasBalanceData}
                    />
                  )}
                  {/* Privacy toggle button */}
                  <button
                    onClick={toggleBalanceVisibility}
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-1"
                    title={showBalances ? "Hide balances" : "Show balances"}
                  >
                    {showBalances ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Balance Display Section */}
              <div className="space-y-2 mb-3">
                {/* Initial State - No Balances Loaded */}
                {!isLoading && Object.keys(balances).length === 0 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    Click "View Balances" to see your stablecoin holdings.
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    <Loader2 className="animate-spin mx-auto mb-1 size-4" />
                    Loading your balances...
                  </div>
                )}

                {/* Balances Loaded - All Regions View */}
                {!isLoading &&
                  Object.keys(balances).length > 0 &&
                  selectedRegion === "All" && (
                    <div>
                      {/* Region List with Balances */}
                      {(() => {
                        const { totals, totalValue } =
                          calculateRegionTotals(balances);
                        // Get all regions, not just ones with balances
                        // Exclude 'All' and 'RWA' (empty region)
                        const allRegions = Object.keys(TOKEN_REGIONS).filter(
                          (r) => r !== "All" && r !== "RWA"
                        );

                        // If no balances at all, show a message
                        if (
                          Object.values(totals).every((amount) => amount === 0)
                        ) {
                          return (
                            <div className="text-xs text-gray-500 text-center py-2">
                              coin balances
                            </div>
                          );
                        }

                        // Show all regions, even if they have zero balances
                        return allRegions.map((region) => {
                          // Get the amount for this region (default to 0)
                          const amount = totals[region] || 0;
                          return (
                            <div
                              key={region}
                              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer mb-2"
                              onClick={() =>
                                setSelectedRegion(region as Region)
                              }
                            >
                              <div
                                className={`w-1 h-full rounded-full ${getRegionColor(
                                  region
                                )}`}
                                style={{ height: "16px" }}
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium">
                                    {region}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {showBalances
                                      ? `$${formatBalance(amount.toString())}`
                                      : formatPercentage(amount, totalValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}

                {/* Balances Loaded - Specific Region View */}
                {!isLoading &&
                  Object.keys(balances).length > 0 &&
                  selectedRegion !== "All" && (
                    <div>
                      {/* Region Header */}
                      <div className="flex items-center gap-2 p-1.5 rounded-md bg-gray-50 dark:bg-gray-800/50 mb-2">
                        <div
                          className={`w-1 h-full rounded-full ${getRegionColor(
                            selectedRegion
                          )}`}
                          style={{ height: "16px" }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium">
                              {selectedRegion}
                            </span>
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const { totals, totalValue } =
                                  calculateRegionTotals(balances);
                                const regionAmount =
                                  totals[selectedRegion] || 0;

                                return showBalances
                                  ? `$${formatBalance(regionAmount.toString())}`
                                  : formatPercentage(regionAmount, totalValue);
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Token List */}
                      <div className="space-y-1 pl-3">
                        {(() => {
                          const tokens =
                            TOKEN_REGIONS[
                              selectedRegion as keyof typeof TOKEN_REGIONS
                            ] || [];

                          if (tokens.length === 0) {
                            return (
                              <div className="text-xs text-gray-500 text-center py-1">
                                No assets in this region
                              </div>
                            );
                          }

                          return tokens.map((token) => {
                            const tokenData = balances[token];
                            return (
                              <div
                                key={token}
                                className="flex justify-between items-center text-xs"
                              >
                                <span>{token}</span>
                                <span>
                                  {(() => {
                                    if (!tokenData) return "0.00";

                                    if (!showBalances) {
                                      // Calculate token's percentage of region total
                                      const { totals } =
                                        calculateRegionTotals(balances);
                                      const regionTotal =
                                        totals[selectedRegion] || 0;
                                      if (regionTotal === 0) return "0%";

                                      return formatPercentage(
                                        tokenData.value,
                                        regionTotal
                                      );
                                    }

                                    return formatBalance(tokenData.amount);
                                  })()}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex gap-2">
                <button
                  className="w-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors flex items-center justify-center"
                  onClick={refreshBalances}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : Object.keys(balances).length > 0 ? (
                    <>
                      <Loader2 className="size-3 mr-1" />
                      Refresh Balances
                    </>
                  ) : (
                    <>
                      <Loader2 className="size-3 mr-1" />
                      View Balances
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profile Link */}
            <div className="rounded-lg border p-3 mb-3">
              <a
                href="/profile"
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="size-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Dashboard</span>
              </a>
            </div>

            {/* Social Links - Compact Row */}
            <div className="rounded-lg border p-3">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2"></div>
                <div className="flex gap-3 justify-center">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center size-7 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      title={link.name}
                    >
                      <link.icon className={cn("size-3.5", link.color)} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
