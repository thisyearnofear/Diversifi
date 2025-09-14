import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';

export const DEFAULT_CHAT_MODEL: string = 'chat-model-large';

// Simplified provider for AI SDK v3 compatibility
const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const myProvider = {
  languageModel: (model: string) => {
    const modelMap: Record<string, any> = {
      'chat-model-small': openai('gpt-4o-mini'),
      'chat-model-large': openai('gpt-4o'),
      'title-model': openai('gpt-4-turbo'),
      'block-model': openai('gpt-4o-mini'),
    };
    return modelMap[model] || openai('gpt-4o-mini');
  },
  imageModel: (model: string) => openai.image('dall-e-3'),
};

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Large model',
    description: 'Large model for complex, multi-step tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning',
  },
];
