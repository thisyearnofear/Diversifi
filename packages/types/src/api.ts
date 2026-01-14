import type { Message as AIMessage } from 'ai';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Chat message extending AI SDK message
 */
export interface Message extends AIMessage {
  userActions?: UserAction[];
}

/**
 * User action tracking
 */
export interface UserAction {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

/**
 * Request/Response for SIWE (Sign in With Ethereum)
 */
export interface SiweChallenge {
  nonce: string;
  message: string;
}

export interface SiweVerifyRequest {
  message: string;
  signature: string;
}

export interface SiweVerifyResponse {
  address: string;
  chainId: number;
}
