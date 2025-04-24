"use client";

import {
  Plus,
  Sidebar as SidebarIcon,
  Sparkles,
  Settings,
  Rocket,
  Globe,
  Coins,
  Wallet,
  Clock,
  User,
} from "lucide-react";
import { SidebarHistory } from "@/components/sidebar-history";
import {
  Sidebar,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { eventBus, EVENTS } from "@/lib/events";
import { toast } from "sonner";
import { useRegion } from "@/contexts/region-context";
import {
  getTokensByRegion,
  getAvailableTokensByRegion,
  getComingSoonTokensByRegion,
} from "@/lib/tokens/token-data";

export function LeftSidebar() {
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedRegion } = useRegion();

  // Get tokens filtered by the selected region
  const availableTokens = getAvailableTokensByRegion(selectedRegion);
  // Only show coming soon tokens if a specific region is selected (not "All")
  const comingSoonTokens =
    selectedRegion === "All" ? [] : getComingSoonTokensByRegion(selectedRegion);

  // Check if we're in a chat
  const isInChat = pathname?.startsWith("/chat/");

  const triggerActionPrompt = (category: string, message: string) => {
    // If we're not in a chat, navigate to home first
    if (!isInChat && pathname !== "/") {
      // Navigate to home page
      router.push("/");

      // Wait for navigation to complete before sending the message
      setTimeout(() => {
        eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, { message, category });
      }, 500);
    } else {
      // Already in a chat or on home page, just send the message immediately
      eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, { message, category });
    }

    // Close mobile sidebar
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>
        <SidebarMenu>
          {/* App Sidebar Content */}
          <SidebarGroupLabel className="text-md font-bold text-primary">
            Stable Station
          </SidebarGroupLabel>
          <SidebarMenuButton onClick={toggleSidebar}>
            <SidebarIcon /> Toggle Sidebar
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <Link href="/" onClick={() => setOpenMobile(false)}>
              <Plus className="text-blue-600 dark:text-blue-400" />
              New Chat
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton
            asChild
            className="bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/30"
          >
            <Link href="/starter-kits" onClick={() => setOpenMobile(false)}>
              <Sparkles className="text-amber-600 dark:text-amber-400" />
              Starter Kits
            </Link>
          </SidebarMenuButton>

          <SidebarGroupLabel className="text-purple-600 dark:text-purple-400">
            Social Actions
          </SidebarGroupLabel>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "FARCASTER",
                "I want to set up a Farcaster account. Can you help me with that directly in this chat?"
              )
            }
            className="bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <Globe className="text-purple-600 dark:text-purple-400" />
            Farcaster Setup
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "LENS",
                "I want to set up a Lens account. Can you help me with that directly in this chat?"
              )
            }
            className="bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <Globe className="text-green-600 dark:text-green-400" />
            Lens Setup
          </SidebarMenuButton>

          <SidebarGroupLabel className="text-green-600 dark:text-green-400">
            Stable Actions
          </SidebarGroupLabel>

          {/* Available Tokens */}
          {availableTokens.map((token) => {
            // Determine the color based on the chain
            let bgColor =
              "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30";
            let textColor = "text-blue-600 dark:text-blue-400";

            if (token.chain === "OPTIMISM") {
              bgColor =
                "bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/30";
              textColor = "text-purple-600 dark:text-purple-400";
            } else if (token.chain === "CELO") {
              bgColor =
                "bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/30";
              textColor = "text-yellow-600 dark:text-yellow-400";
            } else if (token.chain === "POLYGON") {
              bgColor =
                "bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30";
              textColor = "text-indigo-600 dark:text-indigo-400";
            }

            return (
              <SidebarMenuButton
                key={token.id}
                onClick={() =>
                  triggerActionPrompt(
                    token.chain,
                    token.actionPrompt ||
                      `I want to get ${token.symbol} stablecoins. Can you help me directly in this chat?`
                  )
                }
                className={bgColor}
              >
                <Coins className={textColor} />
                Get {token.symbol}
              </SidebarMenuButton>
            );
          })}

          {/* Coming Soon Tokens - No label, just grayed out */}

          {comingSoonTokens.map((token) => {
            // Determine a muted color based on the region
            let bgColor = "bg-gray-50 dark:bg-gray-800/20";
            let textColor = "text-gray-400 dark:text-gray-500";

            // Add a slight hint of the original color
            if (token.region === "Europe") {
              bgColor = "bg-blue-50/30 dark:bg-blue-950/10";
            } else if (token.region === "Africa") {
              bgColor = "bg-green-50/30 dark:bg-green-950/10";
            } else if (token.region === "USA") {
              bgColor = "bg-red-50/30 dark:bg-red-950/10";
            } else if (token.region === "LatAm") {
              bgColor = "bg-yellow-50/30 dark:bg-yellow-950/10";
            } else if (token.region === "Asia") {
              bgColor = "bg-purple-50/30 dark:bg-purple-950/10";
            } else if (token.region === "RWA") {
              bgColor = "bg-amber-50/30 dark:bg-amber-950/10";
            }

            return (
              <SidebarMenuButton
                key={token.id}
                disabled
                className={`${bgColor} ${textColor} cursor-not-allowed opacity-70`}
                tooltip={`${token.name} - Coming Soon`}
              >
                <Clock className="text-gray-400 dark:text-gray-500" />
                Get {token.symbol}
              </SidebarMenuButton>
            );
          })}

          <SidebarGroupLabel className="text-blue-600 dark:text-blue-400">
            On/Off Ramp Actions
          </SidebarGroupLabel>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "WALLET",
                "I want to create an Ethereum wallet. Can you help me set one up directly in this chat?"
              )
            }
            className="bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/30"
          >
            <Wallet className="text-gray-600 dark:text-gray-400" />
            Create Wallet
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>

      {/* Chat History Section */}
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
    </Sidebar>
  );
}
