interface ParsedInteractive {
  type: "connect-wallet" | "fund-wallet" | "transaction" | "options" | "help";
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

export function parseInteractiveCommands(content: string): {
  text: string;
  interactive?: ParsedInteractive;
} {
  // Match both /command[...] and [...] formats
  const commandRegex =
    /(?:\/(?:connect-wallet|fund-wallet|transaction|options|help))?(?:\[(.*?)\])?/;
  const match = content.match(commandRegex);

  if (!match) {
    return { text: content };
  }

  const [fullMatch, args] = match;
  const text = content.replace(fullMatch, "").trim();

  let interactive: ParsedInteractive | undefined;

  try {
    // If we have JSON-looking content, try to parse it
    if (args && args.includes('"options"') && args.endsWith("}")) {
      const parsed = JSON.parse(args);
      if (Array.isArray(parsed.options)) {
        interactive = {
          type: "options",
          options: parsed.options,
        };
      }
    }
  } catch (e) {
    // Don't show error for partial JSON during streaming
    if (!content.endsWith("]")) {
      console.debug("Waiting for complete options JSON");
    } else {
      console.error("Failed to parse options:", e);
    }
  }

  // If no JSON was parsed, check for simple commands
  if (!interactive && content.includes("/connect-wallet")) {
    interactive = { type: "connect-wallet" };
  } else if (!interactive && content.includes("/fund-wallet")) {
    interactive = { type: "fund-wallet" };
  } else if (!interactive && content.includes("/help")) {
    interactive = { type: "help" };
  }

  return { text, interactive };
}
