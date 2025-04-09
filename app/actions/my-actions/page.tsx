"use client";

import { useActions } from "@/hooks/use-actions";
import { useRewards } from "@/hooks/use-rewards";
import { useAuth } from "@/hooks/use-auth";
import { AuthHelper } from "@/components/auth-helper";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Award, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Action {
  id: string;
  actionId: string;
  status: "IN_PROGRESS" | "COMPLETED";
  completedAt?: string;
  action?: {
    title: string;
    description: string;
    difficulty: string;
  };
}

interface Reward {
  id: string;
  claimed: boolean;
  claimedAt?: string;
  action?: {
    title: string;
  };
  type: string;
  details: {
    description: string;
  };
}

export default function MyActionsPage() {
  const { isAuthenticated } = useAuth();
  const {
    userActions,
    isLoading: actionsLoading,
    completeAction,
  } = useActions();
  const { userRewards, isLoading: rewardsLoading, claimReward } = useRewards();

  if (!isAuthenticated) {
    return (
      <div className="container p-8 space-y-8">
        <h1 className="text-2xl font-bold">My Actions</h1>
        <p className="text-muted-foreground mb-4">
          Please authenticate with your wallet to view your actions and rewards
        </p>
        <AuthHelper />
      </div>
    );
  }

  if (actionsLoading || rewardsLoading) {
    return (
      <div className="container p-8 space-y-8">
        <h1 className="text-2xl font-bold">My Actions</h1>
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">
            Loading your actions and rewards...
          </p>
        </div>
      </div>
    );
  }

  const pendingRewards = userRewards.filter(
    (reward: Reward) => !reward.claimed
  );
  const claimedRewards = userRewards.filter((reward: Reward) => reward.claimed);

  return (
    <div className="container p-8 space-y-8">
      <h1 className="text-2xl font-bold">My Actions</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              In Progress Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userActions.filter(
              (action: Action) => action.status === "IN_PROGRESS"
            ).length === 0 ? (
              <p className="text-muted-foreground">No actions in progress</p>
            ) : (
              <ul className="space-y-4">
                {userActions
                  .filter((action: Action) => action.status === "IN_PROGRESS")
                  .map((userAction: Action) => (
                    <li key={userAction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">
                          {userAction.action?.title}
                        </h3>
                        <Badge variant="outline">
                          {userAction.action?.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {userAction.action?.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge
                          className={cn(
                            "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          )}
                        >
                          In Progress
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => completeAction(userAction.actionId)}
                        >
                          Complete
                        </Button>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userActions.filter(
              (action: Action) => action.status === "COMPLETED"
            ).length === 0 ? (
              <p className="text-muted-foreground">No completed actions yet</p>
            ) : (
              <ul className="space-y-4">
                {userActions
                  .filter((action: Action) => action.status === "COMPLETED")
                  .map((userAction: Action) => (
                    <li key={userAction.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">
                          {userAction.action?.title}
                        </h3>
                        <Badge variant="outline">
                          {userAction.action?.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {userAction.action?.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Badge
                          className={cn(
                            "bg-green-100 text-green-800 hover:bg-green-100"
                          )}
                        >
                          Completed
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {userAction.completedAt
                            ? new Date(
                                userAction.completedAt
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">My Rewards</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRewards.length === 0 ? (
              <p className="text-muted-foreground">No pending rewards</p>
            ) : (
              <ul className="space-y-4">
                {pendingRewards.map((reward: Reward) => (
                  <li key={reward.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        {reward.action?.title} Reward
                      </h3>
                      <Badge variant="outline">{reward.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {reward.details.description}
                    </p>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => claimReward(reward.id)}>
                        Claim Reward
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Claimed Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {claimedRewards.length === 0 ? (
              <p className="text-muted-foreground">No claimed rewards yet</p>
            ) : (
              <ul className="space-y-4">
                {claimedRewards.map((reward: Reward) => (
                  <li key={reward.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        {reward.action?.title} Reward
                      </h3>
                      <Badge variant="outline">{reward.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {reward.details.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <Badge
                        className={cn(
                          "bg-green-100 text-green-800 hover:bg-green-100"
                        )}
                      >
                        Claimed
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {reward.claimedAt
                          ? new Date(reward.claimedAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
