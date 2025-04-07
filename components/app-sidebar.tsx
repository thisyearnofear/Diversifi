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
import { useRouter } from "next/navigation";
import { eventBus, EVENTS } from "@/lib/events";
import { toast } from "sonner";

export function AppSidebar() {
  const { setOpenMobile, toggleSidebar } = useSidebar();
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

    // Close mobile sidebar
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarGroupLabel className="text-md font-bold">
            Hello World Computer
          </SidebarGroupLabel>
          <SidebarMenuButton onClick={toggleSidebar}>
            <SidebarIcon /> Toggle Sidebar
          </SidebarMenuButton>
          <SidebarMenuButton asChild>
            <Link href="/" onClick={() => setOpenMobile(false)}>
              <Plus />
              New Chat
            </Link>
          </SidebarMenuButton>
          <SidebarMenuButton asChild>
            <Link href="/starter-kits" onClick={() => setOpenMobile(false)}>
              <Sparkles />
              Starter Kits
            </Link>
          </SidebarMenuButton>

          <SidebarGroupLabel>Actions</SidebarGroupLabel>

          <SidebarMenuButton asChild>
            <Link
              href="/actions/my-actions"
              onClick={() => setOpenMobile(false)}
            >
              <CheckSquare />
              My Actions
            </Link>
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "BASE",
                "Please suggest some actions I can complete on Base blockchain. Show me action cards directly in this chat."
              )
            }
          >
            <Rocket />
            Base Actions
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "FARCASTER",
                "I want to set up a Farcaster account. Can you help me with that directly in this chat?"
              )
            }
          >
            <Globe />
            Farcaster Setup
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "CELO",
                "I'd like to see action cards for Celo blockchain directly in this chat."
              )
            }
          >
            <Coins />
            Celo Actions
          </SidebarMenuButton>

          <SidebarMenuButton
            onClick={() =>
              triggerActionPrompt(
                "ETHEREUM",
                "Show me action cards for Ethereum that I can complete directly in this chat."
              )
            }
          >
            <Globe />
            Ethereum Actions
          </SidebarMenuButton>

          <SidebarGroupLabel>Admin</SidebarGroupLabel>

          <SidebarMenuButton asChild>
            <Link
              href="/admin/starter-kits"
              onClick={() => setOpenMobile(false)}
            >
              <Settings />
              Admin: Starter Kits
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory />
      </SidebarContent>
    </Sidebar>
  );
}
