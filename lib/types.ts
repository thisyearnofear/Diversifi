import type { Message as AIMessage } from 'ai';

export interface InteractiveOptions {
  type: 'connect-wallet' | 'fund-wallet' | 'transaction' | 'options' | 'help';
  options?: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
  transactionData?: {
    to: string;
    value: string;
    data?: string;
  };
}

export interface Message extends AIMessage {
  interactive?: InteractiveOptions;
}
