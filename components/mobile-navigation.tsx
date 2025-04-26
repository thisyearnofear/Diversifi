"use client";

import {
  Menu,
  MessageSquare,
  Sparkles,
  Coins,
  Globe,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { eventBus, EVENTS } from "@/lib/events";

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
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden bg-background/90 backdrop-blur-sm rounded-xl shadow-lg px-2 py-1.5 w-[98vw] max-w-md flex justify-center items-end pointer-events-none">
      <div className="flex flex-row justify-around items-end w-full pointer-events-auto">
        {navItems.map((item, index) => (
          <Button
            key={item.name}
            variant={item.primary ? "default" : "ghost"}
            size="icon"
            className={cn(
              "h-14 w-14 rounded-full flex flex-col items-center justify-center px-0 py-0 bg-background/90",
              "transition-all duration-150 active:scale-95", // Add touch feedback
              item.primary
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-accent",
              // Add subtle staggered animation on initial render
              "animate-fade-in",
              { "animation-delay-100": index === 1 },
              { "animation-delay-200": index === 2 },
              { "animation-delay-300": index === 3 },
              { "animation-delay-400": index === 4 },
              { "animation-delay-500": index === 5 },
              { "animation-delay-600": index === 6 }
            )}
            onClick={() => {
              // Add haptic feedback if available
              if (navigator.vibrate) {
                navigator.vibrate(5);
              }
              item.action();
            }}
            title={item.name}
          >
            <item.icon className="size-6 mb-0.5" />
            <span className="text-[10px] mt-1 leading-tight whitespace-nowrap font-medium">
              {item.name}
            </span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
