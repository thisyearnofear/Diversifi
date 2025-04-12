"use client";

import {
  Twitter,
  MessageCircle,
  Wallet,
  CheckSquare,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Placeholder social links
const socialLinks = [
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://twitter.com",
    color: "text-blue-400",
  },
  {
    name: "Telegram",
    icon: MessageCircle,
    href: "https://t.me",
    color: "text-blue-500",
  },
  {
    name: "Lens",
    icon: ExternalLink,
    href: "https://lens.xyz",
    color: "text-green-500",
  },
  {
    name: "Farcaster",
    icon: ExternalLink,
    href: "https://farcaster.xyz",
    color: "text-purple-500",
  },
];

export function RightSidebar() {
  const isMobile = useIsMobile();

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" side="right">
      <div className="pt-20">
        {" "}
        {/* Add padding to push content below wallet UI */}
        <SidebarContent>
          <div className="flex flex-col gap-4 p-4">
            {/* Wallet Info Section */}
            <div className="rounded-lg border p-4 bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-3 mb-3">
                <Wallet className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Your Wallet</h3>
                  <p className="text-sm text-gray-500">Connected assets</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">ETH:</span> 0.05
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">CELO:</span> 10.2
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">cUSD:</span> 25.0
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/30">
              <div className="flex items-center gap-3 mb-3">
                <CheckSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h3 className="font-medium">Your Progress</h3>
                  <p className="text-sm text-gray-500">Completed actions</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-gray-200 rounded-full flex-1">
                    <div className="h-2 bg-amber-500 rounded-full w-[40%]"></div>
                  </div>
                  <span className="text-xs text-gray-500">40%</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Completed:</span> 2/5 actions
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-3">
                <ExternalLink className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Connect With Us</h3>
                  <p className="text-sm text-gray-500">Join our community</p>
                </div>
              </div>
              <div className="space-y-2">
                {socialLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <link.icon className={cn("h-4 w-4", link.color)} />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
