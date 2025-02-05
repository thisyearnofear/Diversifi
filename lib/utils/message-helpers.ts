import type { Message } from "@/types/message";

export interface UserAction {
  action: string;
  label?: string;
  args?: Array<Record<string, any>>;
}

export const parseMessageContent = (message: Message) => {
  let textContent = message.content || "";
  let userActions: UserAction[] = [];

  try {
    // Try to parse the content as JSON
    const parsed = JSON.parse(textContent);
    textContent = parsed.content || textContent;
    userActions = parsed.userActions || [];
  } catch (e) {
    // If parsing fails, use the content as-is
  }

  // Determine if there should be interactive elements
  const shouldShowInteractive = userActions.length > 0;

  return {
    text: textContent,
    interactive: shouldShowInteractive
      ? {
          type: "actions" as const,
          actions: userActions,
        }
      : null,
  };
};
