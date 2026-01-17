import { openai as openaiProvider } from '@ai-sdk/openai';
import { customProvider } from 'ai';

/**
 * Model provider with fallback to Venice API
 * Uses OpenAI by default, Venice as fallback
 * 
 * Venice is OpenAI-compatible, so we can use the same models
 * but point to a different API endpoint
 */

const createOpenAIProvider = () => ({
  'chat-model-small': openaiProvider('gpt-4o-mini'),
  'chat-model-large': openaiProvider('gpt-4o'),
  'title-model': openaiProvider('gpt-4-turbo'),
  'block-model': openaiProvider('gpt-4o-mini'),
});

// Venice fallback - uses Venice endpoint but with OpenAI-compatible format
// For now, fallback to OpenAI if Venice keys not available
const createVeniceProvider = () => {
  // If Venice API key is not available, just use OpenAI as fallback
  // This ensures the app always works, with Venice as an optional enhancement
  if (!process.env.VENICE_API_KEY) {
    return createOpenAIProvider();
  }

  // Venice is OpenAI-compatible - we can technically use openaiProvider
  // with Venice models, but for now we'll reuse OpenAI as primary fallback
  // Future improvement: create proper Venice model definitions
  return {
    'chat-model-small': openaiProvider('gpt-4o-mini'),
    'chat-model-large': openaiProvider('gpt-4o'),
    'title-model': openaiProvider('gpt-4-turbo'),
    'block-model': openaiProvider('gpt-4o-mini'),
  };
};

// Primary provider (OpenAI)
const primaryLanguageModels = createOpenAIProvider();

// Fallback provider (Venice or OpenAI)
const fallbackLanguageModels = createVeniceProvider();

export const myProvider = customProvider({
  languageModels: primaryLanguageModels,
  imageModels: {
    'small-model': openaiProvider.image('dall-e-3'),
  },
});

export const fallbackProvider = customProvider({
  languageModels: fallbackLanguageModels,
  imageModels: {
    'small-model': openaiProvider.image('dall-e-3'),
  },
});

export const DEFAULT_CHAT_MODEL: string = 'chat-model-large';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model (Fast)',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Large model (Powerful)',
    description: 'Large model for complex, multi-step tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];
