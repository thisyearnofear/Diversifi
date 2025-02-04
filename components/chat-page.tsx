"use client";

import { useChat } from "@/hooks/use-chat";
import { Chat } from "@/components/chat";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";
import { convertToUIMessages } from "@/lib/utils";

export function ChatPage({ id }: { id: string }) {
  const { chat, isLoading, error } = useChat(id);

  if (error?.message === "Unauthorized") return <div>Unauthorized</div>;
  if (error) return <div>Failed to load chat</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!chat) return <div>Chat not found</div>;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(chat.messages)}
        selectedChatModel={DEFAULT_CHAT_MODEL}
        selectedVisibilityType={chat.visibility}
        isReadonly={chat.isReadonly}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
