'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Award, Gift, Star, Zap, ChevronRight } from 'lucide-react';

export function PointsRewards() {
  // Mock data for points and rewards
  const pointsData = {
    total: 0,
    available: 0,
    spent: 0,
    nextLevel: 100,
    level: 1,
  };

  // Calculate progress percentage
  const progressPercentage = Math.min(
    (pointsData.total / pointsData.nextLevel) * 100,
    100,
  );

  // Mock rewards data
  const availableRewards = [
    {
      id: 1,
      name: 'Starter Kit Upgrade',
      description: 'Upgrade your starter kit with additional tokens',
      pointsCost: 50,
      available: true,
    },
    {
      id: 2,
      name: 'NFT Badge',
      description: 'Exclusive NFT badge for your profile',
      pointsCost: 100,
      available: false,
    },
    {
      id: 3,
      name: 'Premium Features',
      description: 'Access to premium features for 30 days',
      pointsCost: 200,
      available: false,
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'Completed Registration',
      points: 10,
      date: '2023-05-15',
    },
    {
      id: 2,
      action: 'First Stablecoin Swap',
      points: 20,
      date: '2023-05-16',
    },
    {
      id: 3,
      action: 'Referred a Friend',
      points: 30,
      date: '2023-05-20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg p-6 border">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Your Points</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Earn points by completing actions and referring friends
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-md border w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Star className="size-5 text-yellow-500" />
              <span className="font-bold text-2xl">{pointsData.total}</span>
            </div>
            <span className="text-sm text-muted-foreground">Total Points</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Level {pointsData.level}</span>
            <span className="text-sm">Level {pointsData.level + 1}</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            {pointsData.nextLevel - pointsData.total} points needed for next
            level
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Award className="size-5 text-purple-500" />
            <h3 className="font-medium">Points Summary</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Available</span>
                <p className="font-medium">{pointsData.available}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Spent</span>
                <p className="font-medium">{pointsData.spent}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">
                Level Progress
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex-1">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="size-5 text-amber-500" />
            <h3 className="font-medium">How to Earn Points</h3>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Complete Registration</span>
              <span className="text-sm font-medium">+10 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Swap Stablecoins</span>
              <span className="text-sm font-medium">+20 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Refer a Friend</span>
              <span className="text-sm font-medium">+30 pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Daily Login</span>
              <span className="text-sm font-medium">+5 pts</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Gift className="size-5 text-green-500" />
            <h3 className="font-medium">Available Rewards</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-3 border rounded-md flex justify-between items-center ${
                !reward.available ? 'opacity-60' : ''
              }`}
            >
              <div>
                <h4 className="font-medium">{reward.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {reward.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {reward.pointsCost} pts
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={
                    !reward.available ||
                    pointsData.available < reward.pointsCost
                  }
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          ))}

          {availableRewards.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No rewards available yet. Complete actions to earn points!
            </p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Star className="size-5 text-blue-500" />
            <h3 className="font-medium">Recent Activities</h3>
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 border rounded-md flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium">{activity.action}</h4>
                <p className="text-xs text-muted-foreground">
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
              <span className="font-medium text-green-600">
                +{activity.points} pts
              </span>
            </div>
          ))}

          {recentActivities.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No recent activities. Start completing actions to earn points!
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
