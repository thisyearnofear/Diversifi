// AI SDK Compatibility Layer - Single source of truth for AI SDK exports
export { streamText, generateText, type Message, type ChatRequest, type ChatRequestOptions } from 'ai';

// Re-export from ai/react for client-side hooks
export { useChat, useCompletion } from 'ai/react';

// Add missing types for compatibility
export type DataStreamWriter = {
  writeData: (data: any) => void;
};
