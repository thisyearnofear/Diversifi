'use client';

import type { User } from "next-auth";

import { Plus, Sidebar as SidebarIcon } from "lucide-react";
import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

export function AppSidebar({ user }: { user: User | undefined }) {
  const { setOpenMobile, toggleSidebar } = useSidebar();

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
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
