"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Coins, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { eventBus, EVENTS } from "@/lib/events";
import { toast } from "sonner";

const actionCategories = [
  {
    name: "Based Actions",
    description: "Explore the Base ecosystem",
    icon: Globe,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    actions: [
      {
        name: "Set up Farcaster Account",
        href: "/actions/based-actions/farcaster",
      },
      {
        name: "Bridge to Base",
        href: "/actions/based-actions/bridge",
      },
    ],
  },
  {
    name: "Stable Actions",
    description: "Build on Celo's stable ecosystem",
    icon: Coins,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    actions: [
      {
        name: "Mint Celo NFT",
        href: "/actions/stable-actions/nft",
      },
      {
        name: "Swap on Ubeswap",
        href: "/actions/stable-actions/ubeswap",
      },
    ],
  },
  {
    name: "Global Actions",
    description: "Connect with Ethereum's global network",
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    actions: [
      {
        name: "Deploy Smart Contract",
        href: "/actions/global-actions/deploy",
      },
      {
        name: "Participate in DAO",
        href: "/actions/global-actions/dao",
      },
    ],
  },
];

export function ActionSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const triggerActionPrompt = (category: string, message: string) => {
    // If we're not on the home page, navigate there first
    if (window.location.pathname !== "/") {
      // Navigate to home page
      router.push("/");

      // Wait for navigation to complete before sending the message
      setTimeout(() => {
        eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, message);
        toast.success(`Looking for ${category} actions...`);
      }, 500);
    } else {
      // Already on home page, just send the message immediately
      eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, message);
      toast.success(`Looking for ${category} actions...`);
    }
  };

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>
        <h2 className="text-lg font-semibold px-4">Action Hub</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-4 p-4">
          {actionCategories.map((category) => (
            <motion.div
              key={category.name}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                category.borderColor,
                category.bgColor
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <category.icon className={cn("h-5 w-5", category.color)} />
                <div>
                  <h3 className={cn("font-medium", category.color)}>
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {category.actions.map((action) => {
                  // Special handling for Farcaster action
                  if (action.name === "Set up Farcaster Account") {
                    return (
                      <button
                        key={action.name}
                        onClick={() =>
                          triggerActionPrompt(
                            "FARCASTER",
                            "I want to set up a Farcaster account. Can you help me with that directly in this chat?"
                          )
                        }
                        className={cn(
                          "block px-3 py-2 rounded-md text-sm transition-colors text-left w-full",
                          "text-gray-600 hover:bg-white/50"
                        )}
                      >
                        {action.name}
                      </button>
                    );
                  }

                  // Default handling for other actions
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === action.href
                          ? "bg-white text-gray-900"
                          : "text-gray-600 hover:bg-white/50"
                      )}
                    >
                      {action.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
