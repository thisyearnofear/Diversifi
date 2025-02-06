import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
  Output,
} from "ai";

import { auth } from "@/app/auth";
import { myProvider } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";

import { generateTitleFromUserMessage } from "../../actions";
import { createDocument } from "@/lib/ai/tools/create-document";
import { updateDocument } from "@/lib/ai/tools/update-document";
import { requestSuggestions } from "@/lib/ai/tools/request-suggestions";
import {
  pythActionProvider,
  walletActionProvider,
  AgentKit,
} from "@coinbase/agentkit";
import { erc20ActionProvider } from "@/lib/web3/agentkit/action-providers/erc20/erc20ActionProvider";
import { PrivyWalletProvider } from "@/lib/web3/agentkit/wallet-providers/privyWalletProvider";
import { agentKitToTools } from "@/lib/web3/agentkit/framework-extensions/ai-sdk";
import { basenameActionProvider } from "@/lib/web3/agentkit/action-providers/basename/basenameActionProvider";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();
  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  // If user is authenticated, save chat history
  if (session?.user?.id) {
    const chat = await getChatById({ id });
    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      await saveChat({ id, userId: session.user.id, title });
    }
    await saveMessages({
      messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
    });
  }

  const walletProvider = await PrivyWalletProvider.configureWithWallet({
    appId: process.env.PRIVY_APP_ID as string,
    appSecret: process.env.PRIVY_APP_SECRET as string,
    networkId: "base-sepolia",
    walletId: process.env.PRIVY_WALLET_ID as string,
    authorizationKey: process.env.PRIVY_WALLET_AUTHORIZATION_KEY as string,
  });

  const agentKit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      basenameActionProvider(),
    ],
  });

  const tools = agentKitToTools(agentKit);

  console.log("");

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: systemPrompt({ selectedChatModel }),
        messages,
        maxSteps: 5,
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
                    "An additional label with more context about the action for the user"
                  ),
                args: z.record(z.any()).optional(),
              })
            ),
          }),
        }),
        // experimental_transform: smoothStream({ chunking: "word" }),
        experimental_generateMessageId: generateUUID,
        tools: {
          ...tools,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream,
          }),
        },
        onFinish: async ({ response, reasoning, text }) => {
          // currently the content of the last message is truncated, so passing in the text as a partial fix
          const assistantMessages = response.messages.filter(
            (message) => message.role === "assistant"
          );
          const lastAssistantMessage =
            assistantMessages[assistantMessages.length - 1];
          if (lastAssistantMessage) {
            response.messages[response.messages.length - 1] = {
              ...lastAssistantMessage,
              content: [
                {
                  type: "text",
                  text,
                },
              ],
            };
          }
          if (session.user?.id) {
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
                      typeof message.content === "string"
                        ? message.content
                        : JSON.stringify(message.content),
                    createdAt: new Date(),
                  };
                }),
              });
            } catch (error) {
              console.error("Failed to save chat");
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      return "Oops, an error occured!";
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
