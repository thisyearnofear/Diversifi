"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/use-auth";
import { AuthHelper } from "@/components/auth-helper";
import { UserProfile } from "@/components/profile/user-profile";
import { DiversifiVisualizer } from "@/components/profile/diversifi-visualizer";
import { useTokenBalances, TOKEN_REGIONS } from "@/hooks/use-token-balances";
type RegionKey = keyof typeof TOKEN_REGIONS;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeparateAuthButtons } from "@/components/separate-auth-buttons";
import { cn } from "@/lib/utils";

// Utility: compute region allocations from balances
function useRegionAllocations(balances: Record<string, any>) {
  // Memoize for performance
  return useMemo(() => {
    // Calculate totals for each region
    const regionTotals: Record<string, number> = {};
    let globalTotal = 0;
    Object.keys(TOKEN_REGIONS).forEach((region) => {
      if (region !== "All") {
        regionTotals[region] = 0;
        TOKEN_REGIONS[region as RegionKey].forEach((token: string) => {
          const tokenRecord = balances[token];
          if (tokenRecord && !tokenRecord.loading && !tokenRecord.error) {
            regionTotals[region] += tokenRecord.value;
            globalTotal += tokenRecord.value;
          }
        });
      }
    });

    // Convert to proportions (default to zero if no value)
    const allocations: Record<string, number> = {};
    Object.keys(regionTotals).forEach((region) => {
      allocations[region] =
        globalTotal > 0 ? regionTotals[region] / globalTotal : 0;
    });

    return allocations;
  }, [balances]);
}

export default function ProfilePage() {
  const { isConnected } = useAccount();
  const { isAuthenticated } = useAuth();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const isMobile = useIsMobile();

  // State for DiversiFi data loading
  const {
    balances,
    isLoading: isDiversifiLoading,
    refreshBalances: refreshDiversifiBalances,
  } = useTokenBalances("All"); // Always initialize with "All" to prepare for data loading

  // Track if this is the first load to show skeleton instead of spinner on refresh
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const regionAllocations = useRegionAllocations(balances);

  // Simulate loading state for entire page (not affected by balances)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Load DiversiFi data when the tab is selected
  useEffect(() => {
    if (activeTab === "diversifi" && isFirstLoad) {
      // Load data when the tab is selected for the first time
      refreshDiversifiBalances();
      setIsFirstLoad(false);
    }
  }, [activeTab, isFirstLoad, refreshDiversifiBalances]);

  // If entire page is still loading (not just DiversiFi), show loader
  if (isLoadingPage) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container p-8 space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Please connect your wallet to view your dashboard
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container p-8 space-y-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Please authenticate with your wallet to access your dashboard
        </p>
        <AuthHelper />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-3xl mx-auto",
        "p-0 sm:p-6 pt-4 md:pt-6",
        "space-y-6 md:space-y-8",
        "px-2 md:px-0"
      )}
    >
      <h1
        className={`font-bold text-center ${
          isMobile ? "text-2xl" : "text-3xl"
        }`}
      >
        Dashboard
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {isMobile ? (
          <TabsList className="w-full flex mb-4 p-0 sticky top-14 z-10 bg-background/95 backdrop-blur-sm shadow-sm rounded-lg">
            <TabsTrigger
              value="profile"
              className="flex-1 py-2.5 text-sm font-medium active:scale-95 transition-all duration-150"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="diversifi"
              className="flex-1 py-2.5 text-sm font-medium active:scale-95 transition-all duration-150"
            >
              Diversifi
            </TabsTrigger>
          </TabsList>
        ) : (
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="diversifi">DiversiFi</TabsTrigger>
            <TabsTrigger value="referrals" className="text-muted-foreground">
              Referrals
            </TabsTrigger>
            <TabsTrigger value="points" className="text-muted-foreground">
              Points
            </TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
        )}

        {/* Profile Section */}
        <TabsContent
          value="profile"
          className="space-y-6 w-full flex flex-col items-center"
        >
          <Card className="w-full shadow-md">
            <CardContent className={isMobile ? "px-4 py-6" : "py-6"}>
              <div className="flex flex-col items-center justify-center">
                <UserProfile />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DiversiFi Section: Auto-loads when tab is selected */}
        <TabsContent value="diversifi" className="space-y-6 w-full">
          <Card className="w-full shadow-md">
            <CardContent className={isMobile ? "p-4" : "p-6"}>
              {isDiversifiLoading && isFirstLoad ? (
                <div className="space-y-6">
                  {/* Skeleton UI for first load */}
                  <div className="w-full flex items-center justify-between pb-2 border-b">
                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* Skeleton for map visualization */}
                  <div className="w-full h-[350px] bg-gray-100 dark:bg-gray-900/50 rounded-lg border flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <span className="text-sm text-muted-foreground">
                        Loading your portfolio data...
                      </span>
                      <span className="text-xs text-muted-foreground max-w-xs text-center">
                        We're analyzing your stablecoin holdings across
                        different regions
                      </span>
                    </div>
                  </div>

                  {/* Skeleton for pie chart */}
                  <div className="w-full h-[200px] bg-gray-100 dark:bg-gray-900/50 rounded-lg border"></div>

                  {/* Skeleton for metrics */}
                  <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 dark:bg-gray-900/50 rounded-lg border"
                      ></div>
                    ))}
                  </div>
                </div>
              ) : isDiversifiLoading ? (
                <div className="relative">
                  {/* Overlay loading state for refreshes */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                      <span className="text-sm font-medium">
                        Refreshing data...
                      </span>
                    </div>
                  </div>

                  {/* Keep showing the previous visualization during refresh */}
                  <DiversifiVisualizer
                    regionAllocations={regionAllocations}
                    onRefresh={refreshDiversifiBalances}
                  />
                </div>
              ) : (
                <DiversifiVisualizer
                  regionAllocations={regionAllocations}
                  onRefresh={refreshDiversifiBalances}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6 w-full">
          <Card className="w-full shadow-md">
            <CardHeader className={isMobile ? "px-4 py-4" : undefined}>
              <CardTitle className={isMobile ? "text-xl" : undefined}>
                Referrals
              </CardTitle>
              <CardDescription>
                Track your referrals and earn points
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-4" : undefined}>
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  The referral system is currently under development. Soon
                  you'll be able to invite friends and earn points when they
                  join Stable Station.
                </p>
                <Button
                  variant="outline"
                  disabled
                  className="opacity-50 active:scale-95 transition-all duration-150"
                >
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-6 w-full">
          <Card className="w-full shadow-md">
            <CardHeader className={isMobile ? "px-4 py-4" : undefined}>
              <CardTitle className={isMobile ? "text-xl" : undefined}>
                Points System
              </CardTitle>
              <CardDescription>
                Track your platform usage and earn points
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-4" : undefined}>
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  The points system is currently under development. Soon you'll
                  be able to track your platform usage and earn points for using
                  Stable Station features.
                </p>
                <Button
                  variant="outline"
                  disabled
                  className="opacity-50 active:scale-95 transition-all duration-150"
                >
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6 w-full">
          <Card className="w-full shadow-md">
            <CardHeader className={isMobile ? "px-4 py-4" : undefined}>
              <CardTitle className={isMobile ? "text-xl" : undefined}>
                Admin: Starter Kits
              </CardTitle>
              <CardDescription>
                Manage starter kits for users (Sponsor access only)
              </CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "px-4 py-4" : undefined}>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-muted-foreground mb-2 text-sm md:text-base">
                    This feature is currently under development
                  </p>
                  <Button
                    variant="outline"
                    disabled
                    className="opacity-50 active:scale-95 transition-all duration-150"
                  >
                    Manage Starter Kits
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
