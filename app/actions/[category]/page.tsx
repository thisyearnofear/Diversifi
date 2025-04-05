"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { ActionCard } from "@/components/action-card";
import { useActions } from "@/hooks/use-actions";
import { useAuth } from "@/hooks/use-auth";
import { AuthHelper } from "@/components/auth-helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryToChain = {
  "based-actions": "BASE",
  "stable-actions": "CELO",
  "global-actions": "ETHEREUM",
} as const;

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const chain =
    categoryToChain[params.category as keyof typeof categoryToChain];

  if (!chain) {
    notFound();
  }

  const { isAuthenticated } = useAuth();
  const { userActions, isLoading } = useActions();
  const [actions, setActions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Fetch actions from API
    fetch(`/api/actions/category/${params.category}`)
      .then((res) => res.json())
      .then((data) => setActions(data))
      .catch((error) => console.error("Failed to fetch actions:", error));
  }, [params.category]);

  // Find user actions for this chain
  const userActionsForChain =
    userActions?.filter((ua) => ua.action?.chain === chain) || [];

  // Filter actions based on active tab
  const filteredActions = actions.filter((action) => {
    if (activeTab === "all") return true;
    if (activeTab === "in-progress") {
      return userActionsForChain.some(
        (ua) => ua.actionId === action.id && ua.status === "IN_PROGRESS"
      );
    }
    if (activeTab === "completed") {
      return userActionsForChain.some(
        (ua) => ua.actionId === action.id && ua.status === "COMPLETED"
      );
    }
    return true;
  });

  // Map actions to include user action status
  const actionsWithStatus = filteredActions.map((action) => {
    const userAction = userActionsForChain.find(
      (ua) => ua.actionId === action.id
    );
    return { action, userAction };
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="mb-8 text-3xl font-bold">
          {params.category
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </h1>
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            Please authenticate with your wallet to track your progress on
            actions
          </p>
          <AuthHelper />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">
        {params.category
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </h1>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Actions</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <p className="text-muted-foreground mb-4">
            All available actions for {chain.toLowerCase()}
          </p>
        </TabsContent>
        <TabsContent value="in-progress" className="mt-4">
          <p className="text-muted-foreground mb-4">
            Actions you have started but not yet completed
          </p>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <p className="text-muted-foreground mb-4">
            Actions you have successfully completed
          </p>
        </TabsContent>
      </Tabs>

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Loading actions...</p>
        </div>
      ) : actionsWithStatus.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">
            {activeTab === "all"
              ? "No actions available"
              : activeTab === "in-progress"
              ? "No actions in progress"
              : "No completed actions"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actionsWithStatus.map(({ action, userAction }) => (
            <ActionCard
              key={action.id}
              action={action}
              userAction={userAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
