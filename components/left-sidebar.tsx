"use client";

import {
  Plus,
  Sidebar as SidebarIcon,
  Sparkles,
  Settings,
  CheckSquare,
  Rocket,
  Globe,
  Coins,
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

export function LeftSidebar() {
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're in a chat
  const isInChat = pathname?.startsWith("/chat/");

  const triggerActionPrompt = (category: string, message: string) => {
    // If we're not in a chat, navigate to home first
    if (!isInChat && pathname !== "/") {
      // Navigate to home page
      router.push("/");

      // Wait for navigation to complete before sending the message
      setTimeout(() => {
        eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, message);
        toast.success(`Looking for ${category} actions...`);
      }, 500);
    } else {
      // Already in a chat or on home page, just send the message immediately
      eventBus.emit(EVENTS.SEND_CHAT_MESSAGE, message);
      toast.success(`Looking for ${category} actions...`);
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

          <SidebarGroupLabel className="text-green-600 dark:text-green-400">
            Actions
          </SidebarGroupLabel>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "OPTIMISM",
                "I want to get Euro-backed stablecoins on Optimism. Can you help me directly in this chat?"
              )
            }
            className="bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/30"
          >
            <Rocket className="text-purple-600 dark:text-purple-400" />
            Get EURA
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "BASE",
                "I want to get USD-backed stablecoins on Base. Can you help me directly in this chat?"
              )
            }
            className="bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <Rocket className="text-blue-600 dark:text-blue-400" />
            Get USDbC
          </SidebarMenuButton>

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

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "CELO",
                "I want to get USD-backed stablecoins on Celo. Can you help me directly in this chat?"
              )
            }
            className="bg-yellow-50 dark:bg-yellow-950/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          >
            <Coins className="text-yellow-600 dark:text-yellow-400" />
            Get cUSD
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "ETHEREUM",
                "Show me action cards for Ethereum that I can complete directly in this chat."
              )
            }
            className="bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-700/30"
          >
            <Globe className="text-gray-600 dark:text-gray-400" />
            Ethereum Actions
          </SidebarMenuButton>

          <SidebarGroupLabel className="text-red-600 dark:text-red-400">
            Admin
          </SidebarGroupLabel>

          <SidebarMenuButton
            asChild
            className="bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <Link
              href="/admin/starter-kits"
              onClick={() => setOpenMobile(false)}
            >
              <Settings className="text-red-600 dark:text-red-400" />
              Admin: Starter Kits
            </Link>
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
