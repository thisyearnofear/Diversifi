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
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useRegion, type Region } from '@/contexts/region-context';
import { Badge } from '@/components/ui/badge';
import { getAvailableTokensByRegion } from '@/lib/tokens/token-data';
import { useTokenBalances, TOKEN_REGIONS } from '@/hooks/use-token-balances';
import { ConnectButton } from '@/components/connect-button-new';
import { useStarterKit } from '@/hooks/use-starter-kit';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getRegionStyle,
  getCardStyle,
  getAnimationStyle,
} from '@/lib/styles/style-utils';

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

// Social links with icons and URLs
export const socialLinks = [
  {
    name: 'Farcaster',
    icon: MessageCircle,
    href: 'https://warpcast.com/papa',
    color: 'text-purple-500',
  },
  {
    name: 'Lens',
    icon: Globe,
    href: 'https://hey.xyz/u/papajams',
    color: 'text-green-500',
  },
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

// Helper function to get region color using our style utilities
const getRegionColor = (region: string): string => {
  return getRegionStyle(region, 'strong', 'bg');
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
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded cursor-pointer',
                'bg-blue-100 dark:bg-blue-700',
                'text-blue-600 dark:text-blue-50',
                'hover:bg-blue-200 dark:hover:bg-blue-600',
              )}
            >
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

export function RightSidebar() {
  const isMobile = useIsMobile();
  const { selectedRegion, setSelectedRegion } = useRegion();
  const { balances, isLoading, refreshBalances } =
    useTokenBalances(selectedRegion);
  const [showBalances, setShowBalances] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showBalances');
      return saved === 'true';
    }
    return false;
  });
  const [diversiScore, setDiversiScore] = useState<number | null>(null);
  const [hasBalanceData, setHasBalanceData] = useState(false);
  // Starter kit logic state
  const [isRequesting, setIsRequesting] = useState(false);
  // Use useStarterKit at the top level, not conditionally
  const { claimed } = useStarterKit();
  // Handler for starter kit icon click
  const handleStarterKitClick = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    try {
      const response = await fetch('/api/starter-kit/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        if (typeof window !== 'undefined' && window.location)
          window.location.reload();
      }
      // Optionally: show toast here if desired
    } catch {
      // Optionally: show error toast
    } finally {
      setIsRequesting(false);
    }
  };

  // Update localStorage when preference changes
  const toggleBalanceVisibility = () => {
    const newValue = !showBalances;
    setShowBalances(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showBalances', String(newValue));
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
    }
  }, [balances, isLoading]);

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarContent>
        <div className="flex flex-col gap-3 p-3 max-w-[220px] mx-auto">
          {/* Auth Buttons and icons row (inside ConnectButton) */}
          <div className="mb-4 mt-2 bg-background/80 backdrop-blur-sm p-3 rounded-lg border shadow-sm">
            <ConnectButton />
          </div>
          {/* Region Selector - More Compact */}
          <div className="p-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Globe className="size-4 text-blue-500 dark:text-blue-400" />
              <h3 className="font-medium text-sm">Region Selector</h3>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5">
              {regions.map((region) => {
                // Get the count of available tokens for this region
                const availableTokens = getAvailableTokensByRegion(region.id);
                const availableCount = availableTokens.length;

                // Extract color name from the color class
                const colorName = region.color.split('-')[1];

                return (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={cn(
                      'flex items-center gap-1.5 text-xs p-1.5 rounded-md transition-colors',
                      selectedRegion === region.id
                        ? `bg-${colorName}-100 dark:bg-${colorName}-700 text-${colorName}-600 dark:text-${colorName}-50 font-medium`
                        : `text-${colorName}-600 dark:text-${colorName}-200 hover:bg-${colorName}-50 dark:hover:bg-${colorName}-800/70`,
                    )}
                    title={`${region.name} - ${availableCount} available tokens`}
                  >
                    <region.icon className={cn('size-3.5', region.color)} />
                    <span>{region.name}</span>
                    {availableCount > 0 && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-1 py-0 h-4 ml-1',
                          selectedRegion === region.id
                            ? `border-${colorName}-300 dark:border-${colorName}-600 bg-${colorName}-100/50 dark:bg-${colorName}-800/50`
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

          {/* DiversiFi - Portfolio Diversification Teaser */}
          <div
            className={getCardStyle({ variant: 'neutral', className: 'p-4' })}
          >
            <div className="flex flex-col items-center mb-3">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-blue-500" />
                <h3 className="font-medium text-sm">Stables</h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedRegion === 'All' && (
                  <DiversiScore score={diversiScore} hasData={hasBalanceData} />
                )}
                {/* Privacy toggle button */}
                <button
                  onClick={toggleBalanceVisibility}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded transition-colors mt-1',
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
                    'hover:bg-gray-200 dark:hover:bg-gray-700',
                  )}
                  title={showBalances ? 'Hide balances' : 'Show balances'}
                >
                  {showBalances ? 'Hide' : 'Show'}
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
                <div
                  className={cn(
                    'text-xs text-gray-500 text-center py-2',
                    getAnimationStyle(),
                  )}
                >
                  <Loader2 className="animate-spin mx-auto mb-1 size-4" />
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
                      const { totals, totalValue } =
                        calculateRegionTotals(balances);
                      // Get all regions, not just ones with balances
                      // Exclude 'All' and 'RWA' (empty region)
                      const allRegions = Object.keys(TOKEN_REGIONS).filter(
                        (r) => r !== 'All' && r !== 'RWA',
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
                            className={cn(
                              'flex items-center gap-2 p-1.5 rounded-md cursor-pointer mb-2',
                              'hover:bg-gray-100 dark:hover:bg-gray-800',
                            )}
                            onClick={() => setSelectedRegion(region as Region)}
                          >
                            <div
                              className={cn(
                                'w-1 h-full rounded-full',
                                getRegionColor(region),
                              )}
                              style={{ height: '16px' }}
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
                selectedRegion !== 'All' && (
                  <div>
                    {/* Region Header */}
                    <div
                      className={cn(
                        'flex items-center gap-2 p-1.5 rounded-md mb-2',
                        getRegionStyle(selectedRegion, 'light', 'bg'),
                      )}
                    >
                      <div
                        className={cn(
                          'w-1 h-full rounded-full',
                          getRegionColor(selectedRegion),
                        )}
                        style={{ height: '16px' }}
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
                                  if (!tokenData) return '0.00';

                                  if (!showBalances) {
                                    // Calculate token's percentage of region total
                                    const { totals } =
                                      calculateRegionTotals(balances);
                                    const regionTotal =
                                      totals[selectedRegion] || 0;
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
              <button
                className={cn(
                  'w-full text-xs py-1.5 rounded transition-colors flex items-center justify-center',
                  'bg-blue-100 hover:bg-blue-200 dark:bg-blue-700 dark:hover:bg-blue-600',
                  'text-blue-600 dark:text-blue-50',
                )}
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
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
