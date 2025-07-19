"use client";

import React from 'react';
import type { Vote } from '@/lib/db/schema';
import { Messages } from '../messages';
import { useChatContext } from '@/contexts/chat-context';
import { useBlockSelector } from '@/hooks/use-block';

interface ChatMessagesProps {
  chatId: string;
  votes?: Array<Vote>;
  isReadonly: boolean;
}

export function ChatMessages({ chatId, votes, isReadonly }: ChatMessagesProps) {
  const { isLoading, messages, setMessages, reload } = useChatContext();
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <Messages
      chatId={chatId}
      isLoading={isLoading}
      votes={votes}
      messages={messages}
      setMessages={setMessages}
      reload={reload}
      isReadonly={isReadonly}
      isBlockVisible={isBlockVisible}
    />
  );
}
