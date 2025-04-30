"use client";

import {
  Plus,
  Sidebar as SidebarIcon,
  Sparkles,
  Globe,
  Coins,
  Wallet,
  Clock,
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
import { useRegion } from "@/contexts/region-context";
import {
  getTokensByRegion,
  getAvailableTokensByRegion,
  getComingSoonTokensByRegion,
} from "@/lib/tokens/token-data";
import { cn } from "@/lib/utils";
import { 
  getChainStyle, 
  getRegionStyle, 
  getSidebarMenuButtonStyle 
} from "@/lib/styles/style-utils";

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
            className={getChainStyle('BASE', 'light', 'bg')}
          >
            <Link href="/" onClick={() => setOpenMobile(false)}>
              <Plus className={getChainStyle('BASE', 'medium', 'text')} />
              New Chat
            </Link>
          </SidebarMenuButton>
          
          <SidebarMenuButton
            asChild
            className={getRegionStyle('RWA', 'light', 'bg')}
          >
            <Link href="/starter-kits" onClick={() => setOpenMobile(false)}>
              <Sparkles className={getRegionStyle('RWA', 'medium', 'text')} />
              Starter Kits
            </Link>
          </SidebarMenuButton>

          <SidebarGroupLabel className={getChainStyle('OPTIMISM', 'medium', 'text')}>
            Social Actions
          </SidebarGroupLabel>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "FARCASTER",
                "I want to set up a Farcaster account. Can you help me with that directly in this chat?"
              )
            }
            className={getChainStyle('OPTIMISM', 'light', 'bg')}
          >
            <Globe className={getChainStyle('OPTIMISM', 'medium', 'text')} />
            Farcaster Setup
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "LENS",
                "I want to set up a Lens account. Can you help me with that directly in this chat?"
              )
            }
            className={getRegionStyle('Africa', 'light', 'bg')}
          >
            <Globe className={getRegionStyle('Africa', 'medium', 'text')} />
            Lens Setup
          </SidebarMenuButton>

          <SidebarGroupLabel className={getRegionStyle('Africa', 'medium', 'text')}>
            Stable Actions
          </SidebarGroupLabel>

          {/* Available Tokens */}
          {availableTokens.map((token) => (
            <SidebarMenuButton
              key={token.id}
              onClick={() =>
                triggerActionPrompt(
                  token.chain,
                  token.actionPrompt ||
                    `I want to get ${token.symbol} stablecoins. Can you help me directly in this chat?`
                )
              }
              className={getChainStyle(token.chain, 'light', 'bg')}
            >
              <Coins className={getChainStyle(token.chain, 'medium', 'text')} />
              Get {token.symbol}
            </SidebarMenuButton>
          ))}

          {/* Coming Soon Tokens - No label, just grayed out */}
          {comingSoonTokens.map((token) => (
            <SidebarMenuButton
              key={token.id}
              disabled
              className={getSidebarMenuButtonStyle({
                isDisabled: true,
                region: token.region,
              })}
              tooltip={`${token.name} - Coming Soon`}
            >
              <Clock className="text-gray-400 dark:text-gray-500" />
              Get {token.symbol}
            </SidebarMenuButton>
          ))}

          <SidebarGroupLabel className={getChainStyle('BASE', 'medium', 'text')}>
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
