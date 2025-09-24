// Extended types for AI SDK compatibility
import type { Message as BaseMessage } from 'ai';

// Extend the Message type to include reasoning
export interface Message extends BaseMessage {
  reasoning?: string;
}

// Re-export other types
export type { ChatRequest, ChatRequestOptions } from 'ai';