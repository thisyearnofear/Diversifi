import type { Message as AIMessage } from 'ai';
import type { UserAction } from '@/lib/utils/message-helpers';

export interface Message extends AIMessage {
  userActions?: UserAction[];
}
