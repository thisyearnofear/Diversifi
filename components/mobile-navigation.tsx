"use client";

import {
  Menu,
  MessageSquare,
  Sparkles,
  Coins,
  Globe,
  Rocket,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";
import { toast } from "sonner";

export function MobileNavigation() {
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const router = useRouter();

  if (!isMobile) {
    return null;
  }

  const triggerActionPrompt = (category: string, message: string) => {
    // If we're not on the home page, navigate there first
    if (window.location.pathname !== "/") {
      // Navigate to home page
      router.push("/");

      // Wait for navigation to complete before sending the message
      setTimeout(() => {
        eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, { message, category });
      }, 500);
    } else {
      // Already on home page, just send the message immediately
      eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, { message, category });
    }
  };

  const navItems = [
    {
      name: "Menu",
      icon: Menu,
      action: () => setOpenMobile(true),
      primary: true,
    },
    {
      name: "New Chat",
      icon: MessageSquare,
      action: () => router.push("/"),
    },

    {
      name: "Starter Kits",
      icon: Sparkles,
      action: () => router.push("/starter-kits"),
    },
    {
      name: "Get USDbC",
      icon: Rocket,
      action: () =>
        triggerActionPrompt(
          "BASE",
          "I want to get USD-backed stablecoins on Base. Can you help me directly in this chat?"
        ),
    },
    {
      name: "Get EURA",
      icon: Rocket,
      action: () =>
        triggerActionPrompt(
          "OPTIMISM",
          "I want to get Euro-backed stablecoins on Optimism. Can you help me directly in this chat?"
        ),
    },
    {
      name: "Get cUSD",
      icon: Coins,
      action: () =>
        triggerActionPrompt(
          "CELO",
          "I want to get USD-backed stablecoins on Celo. Can you help me directly in this chat?"
        ),
    },
    {
      name: "Social",
      icon: Globe,
      action: () =>
        triggerActionPrompt(
          "SOCIAL",
          "Show me social actions like Farcaster and Lens that I can set up directly in this chat."
        ),
    },
  ];

  return (
    <div className="fixed left-4 top-1/4 z-50 flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant={item.primary ? "default" : "ghost"}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full shadow-md transition-all duration-200",
              item.primary
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-background/80 backdrop-blur-sm hover:bg-accent"
            )}
            onClick={item.action}
            title={item.name}
          >
            <item.icon className="size-5" />
            <span className="sr-only">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
