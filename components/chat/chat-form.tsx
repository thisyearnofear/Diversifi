"use client";

import React, { useState } from 'react';
import type { Attachment } from 'ai';
import { MultimodalInput } from '../multimodal-input';
import { useChatContext } from '@/contexts/chat-context';

interface ChatFormProps {
  chatId: string;
  isReadonly: boolean;
}

export function ChatForm({ chatId, isReadonly }: ChatFormProps) {
  const { input, isLoading } = useChatContext();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  if (isReadonly) {
    return null;
  }

  return (
    <form className="flex w-full px-4 bg-background pb-4 md:pb-6 gap-2">
      <MultimodalInput
        chatId={chatId}
        input={input}
        isLoading={isLoading}
        attachments={attachments}
        setAttachments={setAttachments}
      />
    </form>
  );
}
