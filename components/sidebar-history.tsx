'use client';


import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/db/schema";
import { fetcher } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const { sessionAddress } = useAuth();
  const { data: history } = useSWR<Array<Chat>>(
    sessionAddress ? "/api/history" : null,
    fetcher,
    {
      fallbackData: [],
    }
  );

  if (!sessionAddress) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  // Simple rendering first to debug
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2 px-2">
          {history?.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild isActive={chat.id === id}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={() => setOpenMobile(false)}
                      className="w-full"
                    >
                      <span className="block truncate">{chat.title}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="start"
                    className="max-w-[200px] break-words"
                  >
                    {chat.title}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
