import {
  type Message,
  createDataStreamResponse,
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
  getUser,
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
import { erc20ActionProvider } from "@/lib/web3/agentkit/action-providers/erc20";
import { PrivyWalletProvider } from "@/lib/web3/agentkit/wallet-providers/privyWalletProvider";
import { agentKitToTools } from "@/lib/web3/agentkit/framework-extensions/ai-sdk";
import { safeActionProvider } from "@/lib/web3/agentkit/action-providers/safe";
import { zoraActionProvider } from "@/lib/web3/agentkit/action-providers/zora";
import { alchemyActionProvider } from "@/lib/web3/agentkit/action-providers/alchemy";
import { z } from "zod";
import {
  saveUserInformation,
  getUserInformation,
  deleteUserInformationTool,
} from "@/lib/ai/tools/user-information";

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const attachments = messages.flatMap(
    (message) => message.experimental_attachments ?? []
  );

  const attachmentsString = attachments.length
    ? `The user has shared the following files:\n${attachments
        .map(
          (attachment, index) =>
            `${index + 1}. ${attachment.name} (${attachment.contentType}, ${
              attachment.url
            })`
        )
        .join("\n")}`
    : "";

  const session = await auth();
  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  let userProfile = "User is not signed in";
  // If user is authenticated, save chat history
  if (session?.user?.id) {
    const userInfo = await getUser(session.user.id);
    userProfile = `
    ${attachmentsString}
    User's connected wallet is ${userInfo[0].id}
    We have the following information about them: ${userInfo[0].information
      .map((interest) => `${interest.type}: ${interest.content}`)
      .join("\n")}
    ${
      userInfo[0].claimedKits.length > 0
        ? `They have claimed ${userInfo[0].claimedKits.length} kits`
        : ""
    }
    ${
      userInfo[0].createdKits.length > 0
        ? `They have created ${userInfo[0].createdKits.length} kits, of which ${
            userInfo[0].createdKits.filter((kit) => !kit.claimedAt).length
          } are unclaimed`
        : ""
    }
    `;

    console.log("userProfile", userProfile);

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

  const activeChain =
    process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "base"
      ? "base-mainnet"
      : "base-sepolia";
  const walletProvider = await PrivyWalletProvider.configureWithWallet({
    appId: process.env.PRIVY_APP_ID as string,
    appSecret: process.env.PRIVY_APP_SECRET as string,
    networkId: activeChain,
    walletId: process.env.PRIVY_WALLET_ID as string,
    authorizationKey: process.env.PRIVY_WALLET_AUTHORIZATION_KEY as string,
  });

  const agentKit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      safeActionProvider(),
      alchemyActionProvider(process.env.ALCHEMY_API_KEY as string),
      zoraActionProvider(),
    ],
  });

  const tools = agentKitToTools(agentKit);

  console.log(messages);

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system:
          systemPrompt({ selectedChatModel }) + userProfile + attachmentsString,
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
                    "An additional label with more context about the action for the user"
                  ),
                args: z.array(z.record(z.any())).optional(),
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
          saveUserInformation: saveUserInformation({ session }),
          getUserInformation: getUserInformation({ session }),
          deleteUserInformation: deleteUserInformationTool({ session }),
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
      return `Oops, an error occured! ${error}`;
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
