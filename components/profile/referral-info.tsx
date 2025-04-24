"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Check, Users, Link, Share2 } from "lucide-react";

export function ReferralInfo() {
  const [copied, setCopied] = useState(false);

  // This would typically come from your backend
  const referralId = "Papa";
  const referralUrl = `https://stables-station.com/ref/${referralId}`;

  // Mock data for referrals
  const referralStats = {
    total: 0,
    pending: 0,
    completed: 0,
    rewards: 0,
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Referral ID</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share this ID with friends to earn rewards when they join
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-md border">
              <span className="font-medium text-lg">{referralId}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={copyReferralLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button
              className="w-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/30"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Join me on Stable Station",
                    text: "Check out Stable Station for stablecoins and more!",
                    url: referralUrl,
                  });
                } else {
                  copyReferralLink();
                }
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Referral Link
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Referral Stats</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">
                  Total Referrals
                </span>
                <span className="font-medium">{referralStats.total}</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Pending</span>
                <p className="font-medium">{referralStats.pending}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Completed</span>
                <p className="font-medium">{referralStats.completed}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Link className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Referral Rewards</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">
                  Total Rewards
                </span>
                <span className="font-medium">
                  ${referralStats.rewards.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Earn rewards when your referrals complete actions on Stable
                Station
              </p>
              <Button
                className="w-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30"
                disabled={referralStats.rewards <= 0}
              >
                Claim Rewards
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-medium mb-4">How Referrals Work</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-medium">
              1
            </div>
            <p className="text-sm">
              Share your referral ID or link with friends
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-medium">
              2
            </div>
            <p className="text-sm">
              They register on Stable Station using your referral
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-medium">
              3
            </div>
            <p className="text-sm">
              You earn rewards when they complete actions
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-medium">
              4
            </div>
            <p className="text-sm">
              Claim your rewards directly to your wallet
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
