import { type Message, createDataStreamResponse, streamText, Output } from 'ai';

import { auth } from '@/app/auth';
import type { Session } from 'next-auth';
import { myProvider, fallbackProvider } from '@/lib/ai/models';
import { generateSystemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  getUser,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { agentKitToTools } from '@/lib/web3/agentkit/framework-extensions/ai-sdk';
import { z } from 'zod';
import { tool } from 'ai';
import {
  saveUserInformation,
  getUserInformation,
} from '@/lib/ai/tools/user-information';
import { setupAgentKit } from '@/lib/web3/agentkit/setup';
import { generateUserProfile } from '@/lib/ai/prompts/user';
import {
  getAvailableStarterKitsTool,
  claimAvailableStarterKitTool,
} from '@/lib/ai/tools/starter-kit';
import { suggestActionsDefinition } from '@/lib/ai/tools/suggest-actions';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          message: 'Failed to parse request body',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const {
      id,
      messages,
      selectedChatModel,
    }: { id: string; messages: Array<Message>; selectedChatModel: string } =
      requestData;

    if (!id || !messages || !selectedChatModel) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          message: 'id, messages, and selectedChatModel are required',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const attachments = messages.flatMap(
      (message) => message.experimental_attachments ?? [],
    );

    let userProfile = 'User is not signed in';
    let session: Session | null = null;

    try {
      session = await auth();
    } catch (authError) {
      console.error('Authentication error in chat API:', authError);
      // Continue without authentication - app should work without auth
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    if (session?.user?.id) {
      try {
        const userInfo = await getUser(session.user.id);
        if (userInfo && userInfo.length > 0) {
          userProfile = `USER-WALLET-ADDRESS=${
            session.user.id
          }. IMPORTANT: The user has connected their wallet and is fully authenticated. DO NOT suggest connecting a wallet or signing in. ${generateUserProfile(
            {
              userInfo: userInfo[0],
              attachments,
            },
          )}`;
        } else {
          userProfile = `USER-WALLET-ADDRESS=${session.user.id}. User is authenticated but no profile data available.`;
        }
      } catch (userError) {
        console.warn('Failed to load user info, continuing without it:', userError);
        userProfile = `USER-WALLET-ADDRESS=${session.user.id}. (Profile unavailable)`;
      }

      try {
        const chat = await getChatById({ id });
        if (!chat) {
          try {
            const title = await generateTitleFromUserMessage({
              message: userMessage,
            });
            await saveChat({ id, userId: session.user.id, title });
          } catch (titleError) {
            console.warn('Failed to save chat, continuing:', titleError);
          }

          // Only attempt chat limit enforcement if we have a valid session
          if (session?.user?.id) {
            const enforceUrl = process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}/api/chat/enforce-limit`
              : 'http://localhost:3000/api/chat/enforce-limit';

            // Make chat limit enforcement completely non-blocking
            // Use a fire-and-forget approach that won't affect the main flow
            setTimeout(() => {
              fetch(enforceUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  // Include session info to prevent 401
                  Cookie: request.headers.get('cookie') || '',
                },
              }).catch((error: Error) => {
                // Just log the error and continue
                console.warn('Chat limit enforcement failed:', error);
              });
            }, 0);
          }
        }
      } catch (chatError) {
        console.warn('Failed to load/save chat, continuing without persistence:', chatError);
      }

      try {
        await saveMessages({
          messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
        });
      } catch (msgError) {
        console.warn('Failed to save messages, continuing:', msgError);
      }
    }

    let agentKit;
    let tools = {};

    try {
      agentKit = await setupAgentKit();
      tools = agentKitToTools(agentKit);
      console.log('AgentKit setup successful');
    } catch (error) {
      console.error('Failed to setup AgentKit:', error);
      // Continue without AgentKit tools
    }

    return createDataStreamResponse({
      execute: (dataStream) => {
        // Select provider: use Venice fallback if Venice key exists, otherwise use OpenAI
        const hasVeniceKey = !!process.env.VENICE_API_KEY;
        const selectedProvider = hasVeniceKey ? fallbackProvider : myProvider;
        
        console.log(`[Chat API] Using ${hasVeniceKey ? 'Venice (fallback)' : 'OpenAI (primary)'} provider for model: ${selectedChatModel}`);

        const result = streamText({
          model: selectedProvider.languageModel(selectedChatModel),
          system: generateSystemPrompt({ selectedChatModel }) + userProfile,
          messages,
          maxSteps: 10,
          // experimental_activeTools:
          //   selectedChatModel === "chat-model-reasoning"
          //     ? []
          //     : ["createDocument", "updateDocument", "requestSuggestions"],
          experimental_output: Output.object({
            schema: z.object({
              agent: z.string(),
              content: z.string(),
              userActions: z.array(
                z.object({
                  action: z.string(),
                  label: z
                    .string()
                    .optional()
                    .describe(
                      'An additional label with more context about the action for the user',
                    ),
                  args: z.array(z.record(z.any())).optional(),
                }),
              ),
            }),
          }),
          // experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          tools: session
            ? {
                ...tools,
                createDocument: createDocument({ session, dataStream }),
                updateDocument: updateDocument({ session, dataStream }),
                saveUserInformation: saveUserInformation({ session }),
                getUserInformation: getUserInformation({ session }),
                getAvailableStarterKits: getAvailableStarterKitsTool(),
                claimAvailableStarterKit: claimAvailableStarterKitTool(),
                suggestActions: tool({
                  description: suggestActionsDefinition.description,
                  parameters: suggestActionsDefinition.parameters,
                  execute: async ({ category, title, limit }) => {
                    console.log('Executing suggestActions with args:', {
                      category,
                      title,
                      limit,
                    });
                    try {
                      const result = await suggestActionsDefinition.handler(
                        category,
                        title,
                        limit,
                      );
                      console.log('suggestActions result:', result);
                      return result;
                    } catch (error) {
                      console.error('Error in suggestActions:', error);
                      // Return a default action if there's an error
                      return [
                        {
                          title: 'Set up Lens Account',
                          description:
                            'Create a Lens account and join the decentralized social network',
                          chain: category || 'BASE',
                          difficulty: 'beginner',
                          steps: [
                            'Go to onboarding.lens.xyz',
                            'Connect wallet',
                            'Create profile',
                          ],
                          reward: 'Access to the Lens ecosystem',
                          actionUrl: 'https://onboarding.lens.xyz',
                          proofFieldLabel: 'Lens Profile URL',
                          proofFieldPlaceholder:
                            'https://hey.xyz/u/yourusername',
                        },
                      ];
                    }
                  },
                }),
              }
            : {
                ...tools,
                // Provide limited tools when no session is available
                getAvailableStarterKits: getAvailableStarterKitsTool(),
                suggestActions: tool({
                  description: suggestActionsDefinition.description,
                  parameters: suggestActionsDefinition.parameters,
                  execute: async ({ category, title, limit }) => {
                    try {
                      const result = await suggestActionsDefinition.handler(
                        category,
                        title,
                        limit,
                      );
                      return result;
                    } catch (error) {
                      console.error('Error in suggestActions:', error);
                      // Return a default action if there's an error
                      return [
                        {
                          title: 'Set up Lens Account',
                          description:
                            'Create a Lens account and join the decentralized social network',
                          chain: category || 'BASE',
                          difficulty: 'beginner',
                          steps: [
                            'Go to https://onboarding.lens.xyz and sign up',
                            'Connect your wallet',
                            'Create your profile',
                            'Copy your profile URL (e.g. https://hey.xyz/u/username)',
                          ],
                          reward: 'Access to the Lens ecosystem',
                          actionUrl: 'https://onboarding.lens.xyz',
                          proofFieldLabel: 'Lens Profile URL',
                          proofFieldPlaceholder:
                            'https://hey.xyz/u/yourusername',
                        },
                      ];
                    }
                  },
                }),
              },
          onFinish: async ({ response, reasoning, text }) => {
            // currently the content of the last message is truncated, so passing in the text as a partial fix
            const assistantMessages = response.messages.filter(
              (message) => message.role === 'assistant',
            );
            const lastAssistantMessage =
              assistantMessages[assistantMessages.length - 1];
            if (lastAssistantMessage) {
              response.messages[response.messages.length - 1] = {
                ...lastAssistantMessage,
                content: [
                  {
                    type: 'text',
                    text,
                  },
                ],
              };
            }
            if (session?.user?.id) {
              try {
                const sanitizedResponseMessages = sanitizeResponseMessages({
                  messages: response.messages,
                  reasoning,
                });

                await saveMessages({
                  messages: sanitizedResponseMessages.map((message) => {
                    return {
                      id: message.id,
                      chatId: id,
                      role: message.role,
                      content:
                        typeof message.content === 'string'
                          ? message.content
                          : JSON.stringify(message.content),
                      createdAt: new Date(),
                    };
                  }),
                });
              } catch (error) {
                console.error('Failed to save chat');
              }
            } else {
              console.log('No session available, skipping chat save');
            }
          },
        });

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Error in chat stream:', error);
        return `I'm sorry, but I encountered an error while processing your request. Please try again or contact support if the issue persists.`;
      },
    });
  } catch (error) {
    console.error('Unhandled error in chat API:', error);
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        message: 'Please try again later',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response('Not Found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    return new Response(errorMessage, { status: 500 });
  }
}
