"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useRegion, type Region } from "@/contexts/region-context";
import { Badge } from "@/components/ui/badge";
import { getAvailableTokensByRegion } from "@/lib/tokens/token-data";
import { useCkesSwap } from "@/hooks/use-celo-ckes";

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

// Sample wallet assets by region with numeric values for calculations
const walletAssetsByRegion: Record<
  Region,
  { symbol: string; amount: string; value: number }[]
> = {
  All: [
    { symbol: "ETH", amount: "0.05", value: 100 },
    { symbol: "CELO", amount: "10.2", value: 20 },
    { symbol: "cUSD", amount: "25.0", value: 25 },
  ],
  USA: [
    { symbol: "USDbC", amount: "50.0", value: 50 },
    { symbol: "cUSD", amount: "25.0", value: 25 },
    { symbol: "DAI", amount: "75.0", value: 75 },
  ],
  Europe: [
    { symbol: "EURA", amount: "45.0", value: 45 },
    { symbol: "CEUR", amount: "0.0", value: 0 },
  ],
  Africa: [
    { symbol: "cUSD", amount: "25.0", value: 25 },
    { symbol: "cKES", amount: "0.0", value: 0 }, // Placeholder, will show real component below
  ],
  LatAm: [{ symbol: "cREAL", amount: "0.0", value: 0 }],
  Asia: [{ symbol: "USDT", amount: "100.0", value: 100 }],
  RWA: [{ symbol: "PAXG", amount: "0.01", value: 20 }],
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

const calculateRegionTotals = () => {
  const totals: Record<string, number> = {};
  let totalValue = 0;

  // Initialize all regions with 0
  regions.forEach((region) => {
    if (region.id !== "All") {
      totals[region.id] = 0;
    }
  });

  // Calculate totals for each region
  regions.forEach((region) => {
    if (region.id !== "All") {
      walletAssetsByRegion[region.id].forEach((asset) => {
        totals[region.id] += asset.value;
        totalValue += asset.value;
      });
    }
  });

  return { totals, totalValue };
};

// DiversiScore component with click-to-show tooltip
function DiversiScore() {
  const [showTooltip, setShowTooltip] = useState(false);
  const { totals: regionTotals } = calculateRegionTotals();
  const activeRegionsCount = Object.values(regionTotals).filter(
    (v) => v > 0
  ).length;
  const diversityScore = Math.min(Math.ceil(activeRegionsCount * 1.7), 10);

  return (
    <div className="relative mt-1">
      <span
        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded cursor-pointer"
        onClick={() => setShowTooltip(!showTooltip)}
      >
        DiversiScore: {diversityScore}/10
      </span>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
          Measure of geographic portfolio concentration
        </div>
      )}
    </div>
  );
}

export function RightSidebar() {
  const isMobile = useIsMobile();
  const { selectedRegion, setSelectedRegion } = useRegion();
  const {
    balance: ckesBalance,
    status: ckesStatus,
    isSwitchingChain: ckesSwitching,
  } = useCkesSwap();

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
                {selectedRegion === "All" && <DiversiScore />}
              </div>

              {selectedRegion === "All" ? (
                // Show regional overview when "All" is selected
                <div className="space-y-2 mb-3">
                  {(() => {
                    const { totals: regionTotals, totalValue } =
                      calculateRegionTotals();

                    return Object.entries(regionTotals)
                      .filter(([_, amount]) => amount > 0)
                      .map(([region, amount]) => (
                        <div
                          key={region}
                          className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => setSelectedRegion(region as Region)}
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
                                ${amount}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-1 rounded-full">
                              <div
                                className={`h-1 rounded-full ${getRegionColor(
                                  region
                                )}`}
                                style={{
                                  width: `${(amount / totalValue) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              ) : (
                // Show specific region token holdings when a region is selected
                <div className="space-y-2 mb-3">
                  {/* Selected Region Header */}
                  <div className="flex items-center gap-2 p-1.5 rounded-md bg-gray-50 dark:bg-gray-800/50">
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
                          $
                          {(() => {
                            const { totals: regionTotals } =
                              calculateRegionTotals();
                            return regionTotals[selectedRegion] || 0;
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Token Holdings for Selected Region */}
                  <div className="space-y-1 pl-3 mt-2">
                    {walletAssetsByRegion[selectedRegion]
                      .filter(
                        (asset) => asset.symbol === "cKES" || asset.value > 0
                      )
                      .map((asset) => {
                        const isCkes = asset.symbol === "cKES";
                        const amountDisplay = isCkes ? (
                          ckesStatus === "checking" || ckesSwitching ? (
                            <Loader2 className="size-4 animate-spin text-gray-500" />
                          ) : (
                            `${ckesBalance}`
                          )
                        ) : (
                          asset.amount
                        );
                        return (
                          <div
                            key={asset.symbol}
                            className="flex justify-between items-center text-xs"
                          >
                            <span>{asset.symbol}</span>
                            <span>{amountDisplay}</span>
                          </div>
                        );
                      })}
                    {walletAssetsByRegion[selectedRegion].filter(
                      (asset) => asset.value > 0 && asset.symbol !== "cKES"
                    ).length === 0 &&
                      selectedRegion !== "Africa" && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          No assets in this region
                        </div>
                      )}
                  </div>
                </div>
              )}

              <button className="w-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-1.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800/30 transition-colors">
                DiversiFi →
              </button>
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
