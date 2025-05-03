'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Coins,
  Banknote,
  DollarSign,
  Euro,
  Gem,
  Loader2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserProfile } from './user-profile';
import { useRegion, type Region } from '@/contexts/region-context';
import { Badge } from '@/components/ui/badge';
import { DiversifiVisualizer } from './diversifi-visualizer';
import { getAvailableTokensByRegion } from '@/lib/tokens/token-data';
import { useTokenBalances, TOKEN_REGIONS } from '@/hooks/use-token-balances';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Region data with icons and colors
const regions: {
  id: Region;
  name: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: 'All', name: 'All Regions', icon: Globe, color: 'text-blue-500' },
  { id: 'Africa', name: 'Africa', icon: MapPin, color: 'text-green-500' },
  { id: 'Europe', name: 'Europe', icon: Euro, color: 'text-blue-500' },
  { id: 'USA', name: 'USA', icon: DollarSign, color: 'text-red-500' },
  {
    id: 'LatAm',
    name: 'Latin America',
    icon: Banknote,
    color: 'text-yellow-500',
  },
  { id: 'Asia', name: 'Asia', icon: Coins, color: 'text-purple-500' },
  { id: 'RWA', name: 'Real World Assets', icon: Gem, color: 'text-amber-500' },
];

// Helper function to format balance for display
const formatBalance = (balance: string): string => {
  if (!balance || balance === 'NaN') return '0.00';

  const num = Number.parseFloat(balance);
  if (Number.isNaN(num)) return '0.00';
  if (num === 0) return '0.00';

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
  if (total === 0 || amount === 0) return '0%';
  const percentage = (amount / total) * 100;
  if (percentage < 0.1) return '<0.1%';
  return `${percentage.toFixed(1)}%`;
};

// Helper functions for DiversiFi component
const getRegionColor = (region: string): string => {
  switch (region) {
    case 'USA':
      return 'bg-red-400 dark:bg-red-600';
    case 'Europe':
      return 'bg-blue-400 dark:bg-blue-600';
    case 'Africa':
      return 'bg-green-400 dark:bg-green-600';
    case 'LatAm':
      return 'bg-yellow-400 dark:bg-yellow-600';
    case 'Asia':
      return 'bg-purple-400 dark:bg-purple-600';
    case 'RWA':
      return 'bg-amber-400 dark:bg-amber-600';
    default:
      return 'bg-gray-400 dark:bg-gray-600';
  }
};

// Calculate region totals from balances
const calculateRegionTotals = (
  balances: Record<
    string,
    { amount: string; value: number; loading: boolean; error: string | null }
  >,
) => {
  const totals: Record<string, number> = {};
  let totalValue = 0;

  // Initialize all regions with 0
  Object.keys(TOKEN_REGIONS).forEach((region) => {
    if (region !== 'All') {
      totals[region] = 0;
    }
  });

  // Calculate totals for each region
  Object.entries(TOKEN_REGIONS).forEach(([region, tokens]) => {
    if (region !== 'All') {
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
              DiversiScore{hasData && score !== null ? `: ${score}/10` : ''}
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

// Split into two components to avoid conditional hooks
function MobileStablecoinBalances({
  balances,
  isLoading,
  refreshBalances,
}: {
  balances: Record<
    string,
    { amount: string; value: number; loading: boolean; error: string | null }
  >;
  isLoading: boolean;
  refreshBalances: () => void;
}) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="w-full flex mb-4">
        <TabsTrigger value="profile" className="flex-1">
          Profile
        </TabsTrigger>
        <TabsTrigger value="diversifi" className="flex-1">
          Diversifi
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <UserProfile />
      </TabsContent>
      <TabsContent value="diversifi">
        <div className="pt-2">
          {/* Diversifi Section Start */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                Stablecoin Portfolio
              </span>
              <Badge
                variant="outline"
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
              >
                Diversifi
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              {/* Visualizer and metrics */}
              <DiversifiVisualizer
                regionAllocations={(() => {
                  const { totals } = calculateRegionTotals(balances);
                  return totals;
                })()}
                onRefresh={refreshBalances}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                onClick={refreshBalances}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Loader2 className="size-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </Button>
            </div>
          </div>
          {/* Diversifi Section End */}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function DesktopStablecoinBalances({
  balances,
  isLoading,
  refreshBalances,
  selectedRegion,
  setSelectedRegion,
  showBalances,
  toggleBalanceVisibility,
  diversiScore,
  hasBalanceData,
}: {
  balances: Record<
    string,
    { amount: string; value: number; loading: boolean; error: string | null }
  >;
  isLoading: boolean;
  refreshBalances: () => void;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  showBalances: boolean;
  toggleBalanceVisibility: () => void;
  diversiScore: number | null;
  hasBalanceData: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Region Selector */}
      <div className="rounded-lg border p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Globe className="size-5 text-blue-500 dark:text-blue-400" />
          <h3 className="font-medium">Region Selector</h3>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {regions.map((region) => {
            // Get the count of available tokens for this region
            const availableTokens = getAvailableTokensByRegion(region.id);
            const availableCount = availableTokens.length;

            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={cn(
                  'flex items-center gap-1.5 text-sm p-2 rounded-md transition-colors',
                  selectedRegion === region.id
                    ? region.id === 'Africa'
                      ? 'bg-green-100 dark:bg-green-900/30 font-medium'
                      : region.id === 'Europe'
                        ? 'bg-blue-100 dark:bg-blue-900/30 font-medium'
                        : region.id === 'USA'
                          ? 'bg-red-100 dark:bg-red-900/30 font-medium'
                          : region.id === 'LatAm'
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 font-medium'
                            : region.id === 'Asia'
                              ? 'bg-purple-100 dark:bg-purple-900/30 font-medium'
                              : region.id === 'RWA'
                                ? 'bg-amber-100 dark:bg-amber-900/30 font-medium'
                                : 'bg-blue-100 dark:bg-blue-900/30 font-medium'
                    : 'hover:bg-muted',
                )}
                title={`${region.name} - ${availableCount} available tokens`}
              >
                <region.icon className={cn('size-4', region.color)} />
                <span>{region.name}</span>
                {availableCount > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs px-1 py-0 h-5 ml-1',
                      selectedRegion === region.id
                        ? 'bg-primary/20 border-primary/30'
                        : 'bg-muted border-muted-foreground/20',
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

      {/* DiversiFi - Portfolio Diversification */}
      <div className="rounded-lg border p-4 bg-gradient-to-br from-zinc-50 to-gray-50 dark:from-zinc-900 dark:to-gray-900">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-2">
            <Globe className="size-5 text-blue-500" />
            <h3 className="font-medium">Stablecoin Portfolio</h3>
          </div>
        </div>
        {selectedRegion === 'All' && (
          <>
            <DiversiScore score={diversiScore} hasData={hasBalanceData} />
            <div className="my-4 min-h-[300px] flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center size-full">
                  <Loader2 className="animate-spin mb-2 size-8 text-blue-400" />
                  <span className="text-sm text-gray-500">
                    Loading portfolio data...
                  </span>
                </div>
              ) : (
                <DiversifiVisualizer
                  regionAllocations={calculateRegionTotals(balances).totals}
                  onRefresh={refreshBalances}
                />
              )}
              <Button
                className="mt-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
                onClick={refreshBalances}
                disabled={isLoading}
              >
                <Loader2
                  className={cn('size-4 mr-2', isLoading ? 'animate-spin' : '')}
                />
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
            <div className="flex justify-end mt-2">
              <button
                onClick={toggleBalanceVisibility}
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 px-2 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={showBalances ? 'Hide balances' : 'Show balances'}
              >
                {showBalances ? 'Hide' : 'Show'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Balance Display Section */}
      <div className="space-y-4 mb-4">
        {/* Initial State - No Balances Loaded */}
        {!isLoading && Object.keys(balances).length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">
            Click "View Balances" to see your stablecoin holdings.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-sm text-gray-500 text-center py-4">
            <Loader2 className="animate-spin mx-auto mb-2 size-5" />
            Loading your balances...
          </div>
        )}

        {/* Balances Loaded - All Regions View */}
        {!isLoading &&
          Object.keys(balances).length > 0 &&
          selectedRegion === 'All' && (
            <div>
              {/* Region List with Balances */}
              {(() => {
                const { totals, totalValue } = calculateRegionTotals(balances);
                // Get all regions, not just ones with balances
                // Exclude 'All' and 'RWA' (empty region)
                const allRegions = Object.keys(TOKEN_REGIONS).filter(
                  (r) => r !== 'All' && r !== 'RWA',
                );

                // If no balances at all, show a message
                if (Object.values(totals).every((amount) => amount === 0)) {
                  return (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No stablecoin balances found
                    </div>
                  );
                }

                // Show all regions, even if they have zero balances
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allRegions.map((region) => {
                      // Get the amount for this region (default to 0)
                      const amount = totals[region] || 0;
                      return (
                        <div
                          key={region}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border"
                          onClick={() => setSelectedRegion(region as Region)}
                        >
                          <div
                            className={`w-1 h-full rounded-full ${getRegionColor(
                              region,
                            )}`}
                            style={{ height: '24px' }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{region}</span>
                              <span className="text-gray-500">
                                {showBalances
                                  ? `$${formatBalance(amount.toString())}`
                                  : formatPercentage(amount, totalValue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

        {/* Balances Loaded - Specific Region View */}
        {!isLoading &&
          Object.keys(balances).length > 0 &&
          selectedRegion !== 'All' && (
            <div>
              {/* Region Header */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800/50 mb-4">
                <div
                  className={`w-1 h-full rounded-full ${getRegionColor(
                    selectedRegion,
                  )}`}
                  style={{ height: '24px' }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selectedRegion}</span>
                    <span className="text-gray-500">
                      {(() => {
                        const { totals, totalValue } =
                          calculateRegionTotals(balances);
                        const regionAmount = totals[selectedRegion] || 0;

                        return showBalances
                          ? `$${formatBalance(regionAmount.toString())}`
                          : formatPercentage(regionAmount, totalValue);
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token List */}
              <div className="space-y-2 pl-4">
                {(() => {
                  const tokens =
                    TOKEN_REGIONS[
                      selectedRegion as keyof typeof TOKEN_REGIONS
                    ] || [];

                  if (tokens.length === 0) {
                    return (
                      <div className="text-sm text-gray-500 text-center py-2">
                        No assets in this region
                      </div>
                    );
                  }

                  return tokens.map((token) => {
                    const tokenData = balances[token];
                    return (
                      <div
                        key={token}
                        className="flex justify-between items-center p-2 border rounded-md"
                      >
                        <span className="font-medium">{token}</span>
                        <span>
                          {(() => {
                            if (!tokenData) return '0.00';

                            if (!showBalances) {
                              // Calculate token's percentage of region total
                              const { totals } =
                                calculateRegionTotals(balances);
                              const regionTotal = totals[selectedRegion] || 0;
                              if (regionTotal === 0) return '0%';

                              return formatPercentage(
                                tokenData.value,
                                regionTotal,
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
        <Button
          className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
          onClick={refreshBalances}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : Object.keys(balances).length > 0 ? (
            <>
              <Loader2 className="size-4 mr-2" />
              Refresh Balances
            </>
          ) : (
            <>
              <Loader2 className="size-4 mr-2" />
              View Balances
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Main component that decides which view to render
export function StablecoinBalances() {
  const isMobile = useIsMobile();
  const { selectedRegion, setSelectedRegion } = useRegion();
  const { balances, isLoading, refreshBalances } = useTokenBalances();
  const [showBalances, setShowBalances] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showBalances');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  const [diversiScore, setDiversiScore] = useState<number | null>(null);
  const [hasBalanceData, setHasBalanceData] = useState(false);

  // Calculate DiversiScore manually when balances change
  useEffect(() => {
    // Only calculate if we have data
    if (!isLoading && Object.keys(balances).length > 0) {
      // Calculate region totals directly
      const { totals, totalValue } = calculateRegionTotals(balances);

      // Count regions with non-zero balances
      const activeRegionsCount = Object.values(totals).filter(
        (v) => v > 0,
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
    } else {
      // Reset values when no data is available
      setHasBalanceData(false);
      setDiversiScore(null);
    }
  }, [balances, isLoading]);

  const toggleBalanceVisibility = () => {
    const newValue = !showBalances;
    setShowBalances(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showBalances', String(newValue));
    }
  };

  // Render either mobile or desktop view based on screen size
  return isMobile ? (
    <MobileStablecoinBalances
      balances={balances}
      isLoading={isLoading}
      refreshBalances={refreshBalances}
    />
  ) : (
    <DesktopStablecoinBalances
      balances={balances}
      isLoading={isLoading}
      refreshBalances={refreshBalances}
      selectedRegion={selectedRegion}
      setSelectedRegion={setSelectedRegion}
      showBalances={showBalances}
      toggleBalanceVisibility={toggleBalanceVisibility}
      diversiScore={diversiScore}
      hasBalanceData={hasBalanceData}
    />
  );
}
