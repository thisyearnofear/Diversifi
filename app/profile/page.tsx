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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Manual trigger for DiversiFi data calculation/fetch
  const [triggerDiversifi, setTriggerDiversifi] = useState(false);
  const {
    balances,
    isLoading: isDiversifiLoading,
    refreshBalances: refreshDiversifiBalances,
  } = useTokenBalances(triggerDiversifi ? "All" : undefined);

  const regionAllocations = useRegionAllocations(balances);

  // Simulate loading state for entire page (not affected by balances)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingPage(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="container p-6 pt-20 md:pt-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

        {/* Profile Section */}
        <TabsContent value="profile" className="space-y-6 flex flex-col items-center">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Your wallet and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <UserProfile />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DiversiFi Section: Only load balances/metrics when manually triggered */}
        <TabsContent value="diversifi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DiversiFi Portfolio</CardTitle>
              <CardDescription>
                Visualize your global diversification and scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!triggerDiversifi ? (
                <div className="flex flex-col items-center gap-4 py-12">
                  <p className="text-center text-muted-foreground">
                    For performance, portfolio diversification metrics only load once you trigger them.
                  </p>
                  <Button
                    variant="default"
                    onClick={() => setTriggerDiversifi(true)}
                  >
                    Load Portfolio Data
                  </Button>
                </div>
              ) : isDiversifiLoading ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <span className="text-sm text-muted-foreground">
                    Loading portfolio balances&hellip;
                  </span>
                </div>
              ) : (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshDiversifiBalances()}
                    className="mb-2"
                  >
                    Refresh Data
                  </Button>
                  <DiversifiVisualizer regionAllocations={regionAllocations} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Referrals</CardTitle>
              <CardDescription>
                Track your referrals and earn points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-muted-foreground mb-4">
                  The referral system is currently under development. Soon
                  you'll be able to invite friends and earn points when they
                  join Stable Station.
                </p>
                <Button variant="outline" disabled className="opacity-50">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Points System</CardTitle>
              <CardDescription>
                Track your platform usage and earn points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                <p className="text-muted-foreground mb-4">
                  The points system is currently under development. Soon you'll
                  be able to track your platform usage and earn points for using
                  Stable Station features.
                </p>
                <Button variant="outline" disabled className="opacity-50">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin: Starter Kits</CardTitle>
              <CardDescription>
                Manage starter kits for users (Sponsor access only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-muted-foreground mb-2">
                    This feature is currently under development
                  </p>
                  <Button variant="outline" disabled className="opacity-50">
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
