"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

// Fetch chat history from the API
const fetchChatHistory = async (): Promise<Chat[]> => {
  const response = await fetch('/api/history');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch chat history: ${response.status}`);
  }
  
  return response.json();
};

export function useChatHistoryQuery() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['chatHistory'],
    queryFn: fetchChatHistory,
    enabled: isAuthenticated,
    // Cache for 1 minute
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
