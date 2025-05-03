'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';

import { Block } from './block';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { ActionHandler } from './action-handler';
import type { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { ChatProvider } from '@/contexts/chat-context';
import { useChatForm } from '@/hooks/use-chat-form';

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const { isAuthenticated } = useAuth();

  const chatMethods = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      console.log(error);
      toast.error('An error occured, please try again!');
    },
  });

  // We now handle the SEND_CHAT_MESSAGE event in the ActionHandler component

  const { data: votes } = useSWR<Array<Vote>>(
    isAuthenticated ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  const { submitForm } = useChatForm({
    chatId: id,
    handleSubmit: chatMethods.handleSubmit,
    attachments,
    setAttachments,
  });

  return (
    <ChatProvider value={{ ...chatMethods, submitForm }}>
      <div className="flex justify-center w-full h-dvh bg-background">
        <div className="flex flex-col w-full max-w-4xl relative">
          <ChatHeader
            chatId={id}
            selectedModelId={selectedChatModel}
            selectedVisibilityType={selectedVisibilityType}
            isReadonly={isReadonly}
          />

          <Messages
            chatId={id}
            isLoading={chatMethods.isLoading}
            votes={votes}
            messages={chatMethods.messages}
            setMessages={chatMethods.setMessages}
            reload={chatMethods.reload}
            isReadonly={isReadonly}
            isBlockVisible={isBlockVisible}
          />

          <form className="flex w-full px-4 bg-background pb-4 md:pb-6 gap-2">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={chatMethods.input}
                isLoading={chatMethods.isLoading}
                attachments={attachments}
                setAttachments={setAttachments}
              />
            )}
          </form>

          <Block
            chatId={id}
            input={chatMethods.input}
            setInput={chatMethods.setInput}
            handleSubmit={chatMethods.handleSubmit}
            isLoading={chatMethods.isLoading}
            stop={chatMethods.stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={chatMethods.append}
            messages={chatMethods.messages}
            setMessages={chatMethods.setMessages}
            reload={chatMethods.reload}
            votes={votes}
            isReadonly={isReadonly}
          />

          {/* Handler for direct action processing */}
          {!isReadonly && <ActionHandler />}
        </div>
      </div>
    </ChatProvider>
  );
}
