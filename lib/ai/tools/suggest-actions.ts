import type { ActionData } from '@/lib/utils/message-helpers';
import { z } from 'zod';

export async function suggestActions(
  category?: string,
  title?: string,
  limit?: number,
): Promise<ActionData[]> {
  try {
    // Build the URL with query parameters
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:4000';

    const url = new URL('/api/actions/chat-actions', baseUrl);

    if (category) {
      url.searchParams.append('category', category);
    }

    if (title) {
      url.searchParams.append('title', title);
    }

    if (limit) {
      url.searchParams.append('limit', limit.toString());
    }

    // Fetch the actions
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch actions: ${response.statusText}`);
    }

    const actions = await response.json();
    console.log('Suggested actions:', actions);
    return actions;
  } catch (error) {
    console.error('Error suggesting actions:', error);
    return [];
  }
}

export const suggestActionsDefinition = {
  name: 'suggestActions',
  description:
    'Suggest actions for the user to complete based on their interests or questions',
  parameters: z.object({
    category: z
      .string()
      .optional()
      .describe(
        'The category to filter actions by. Can be a blockchain (BASE, CELO, ETHEREUM, OPTIMISM, POLYGON) or an action category (SOCIAL, DEFI, NFT, STABLECOIN, TRADING, REGISTRATION)',
      ),
    title: z
      .string()
      .optional()
      .describe('The specific action title to look for'),
    limit: z
      .number()
      .optional()
      .default(3)
      .describe('The maximum number of actions to return'),
  }),
  handler: suggestActions,
};
