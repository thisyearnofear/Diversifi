"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Check, X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Chat } from "@/lib/db/schema";
import { fetcher, cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Maximum number of chats to keep (should match the server-side limit)
const MAX_CHATS = 3;

// Function to update chat title
async function updateChatTitle(chatId: string, newTitle: string) {
  try {
    const response = await fetch(`/api/chat/${chatId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) {
      throw new Error("Failed to update chat title");
    }

    // Refresh the history data
    await mutate("/api/history");
    return true;
  } catch (error) {
    console.error("Error updating chat title:", error);
    return false;
  }
}

// Function to delete a chat
async function deleteChat(chatId: string) {
  try {
    const response = await fetch(`/api/chat/${chatId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete chat");
    }

    // Refresh the history data
    await mutate("/api/history");
    return true;
  } catch (error) {
    console.error("Error deleting chat:", error);
    return false;
  }
}

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const router = useRouter();
  const { activeAddress } = useAuth();
  const { data: history } = useSWR<Array<Chat>>(
    activeAddress ? "/api/history" : null,
    fetcher,
    {
      fallbackData: [],
    }
  );

  // State for chat renaming and showing more chats
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [showAllChats, setShowAllChats] = useState(false);

  // Enforce maximum number of chats and limit initial display
  const visibleChats = history?.slice(0, showAllChats ? MAX_CHATS : 1);

  if (!activeAddress) {
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

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="px-4 py-2 text-sm font-medium text-muted-foreground">
          Previous Conversations
        </div>
        <SidebarMenu className="gap-2 px-2">
          {visibleChats?.map((chat) => {
            if (!chat.id) return null;

            // If this chat is being edited
            if (editingChatId === chat.id) {
              return (
                <SidebarMenuItem key={chat.id}>
                  <div className="flex items-center gap-1 w-full p-1">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={async () => {
                        if (newTitle.trim()) {
                          const success = await updateChatTitle(
                            chat.id,
                            newTitle
                          );
                          if (success) {
                            toast.success("Chat renamed");
                          } else {
                            toast.error("Failed to rename chat");
                          }
                        }
                        setEditingChatId(null);
                      }}
                    >
                      <Check className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setEditingChatId(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </SidebarMenuItem>
              );
            }

            // Normal display mode
            return (
              <SidebarMenuItem key={chat.id}>
                <div className="flex items-center w-full">
                  <SidebarMenuButton
                    asChild
                    isActive={chat.id === id}
                    className="flex-1"
                  >
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
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-7 opacity-0 group-hover:opacity-100 transition-opacity",
                        chat.id === id ? "opacity-100" : ""
                      )}
                      onClick={() => {
                        setEditingChatId(chat.id);
                        setNewTitle(chat.title);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700",
                        chat.id === id ? "opacity-100" : ""
                      )}
                      onClick={async () => {
                        if (
                          confirm("Are you sure you want to delete this chat?")
                        ) {
                          const success = await deleteChat(chat.id);
                          if (success) {
                            toast.success("Chat deleted");
                            if (chat.id === id) {
                              // If the current chat was deleted, redirect to home
                              router.push("/");
                            }
                          } else {
                            toast.error("Failed to delete chat");
                          }
                        }
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              </SidebarMenuItem>
            );
          })}

          {/* Show more/less button */}
          {history && history.length > 1 && (
            <button
              onClick={() => setShowAllChats(!showAllChats)}
              className="flex items-center justify-center w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {showAllChats ? (
                <>
                  <ChevronUp className="size-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="size-3 mr-1" />
                  Show More ({Math.min(history.length - 1, MAX_CHATS - 1)} more)
                </>
              )}
            </button>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
