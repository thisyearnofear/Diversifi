import type { Message, ChatRequestOptions, CreateMessage } from 'ai';
import { createContext, useContext, type ReactNode } from 'react';

interface ChatContextType {
  messages: Message[];
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (
    e?: React.FormEvent<HTMLFormElement>,
    options?: ChatRequestOptions,
  ) => void;
  submitForm: () => void;
  isLoading: boolean;
  stop: () => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ChatContextType;
}) {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
