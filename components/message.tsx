"use client";

import type { ChatRequestOptions } from "ai";
import type { Message } from "@/types/message";
import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState, useEffect } from "react";

import type { Vote } from "@/lib/db/schema";

import { DocumentToolCall, DocumentToolResult } from "./document";
import { PencilEditIcon, SparklesIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import equal from "fast-deep-equal";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { MessageEditor } from "./message-editor";
import { DocumentPreview } from "./document-preview";
import { MessageReasoning } from "./message-reasoning";
import { InteractiveElement } from "./interactive-element";
import { parseMessageContent } from "@/lib/utils/message-helpers";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.reasoning && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={message.reasoning}
              />
            )}

            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === "user" && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode("edit");
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn("flex flex-col gap-4", {
                    "bg-primary text-primary-foreground px-3 py-2 rounded-xl max-w-[calc(100vw-80px)] md:max-w-none":
                      message.role === "user",
                    "max-w-[calc(100vw-60px)] md:max-w-none":
                      message.role === "assistant",
                  })}
                >
                  {(() => {
                    const { text, interactive } = parseMessageContent(message);
                    return (
                      <>
                        <div className="markdown-content text-[15px] md:text-base">
                          <Markdown>{text}</Markdown>
                        </div>
                        {interactive && (
                          <div className="mt-4">
                            <InteractiveElement
                              actions={interactive.actions}
                              chatId={chatId}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {message.content && mode === "edit" && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                <CompactToolCalls
                  toolInvocations={message.toolInvocations}
                  isReadonly={isReadonly}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      className="w-full mx-auto px-4 group/message"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          }
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Component to handle and display tool calls in a compact way
const CompactToolCalls = ({
  toolInvocations,
  isReadonly,
}: {
  toolInvocations: any[];
  isReadonly: boolean;
}) => {
  // Filter and group tool calls to reduce repetition
  const [groupedCalls, setGroupedCalls] = useState<Record<string, any[]>>({});
  const [showAllCalls, setShowAllCalls] = useState(false);

  useEffect(() => {
    // Group tool calls by name and filter out repetitive ones
    const grouped: Record<string, any[]> = {};

    toolInvocations.forEach((invocation) => {
      const { toolName, state, result } = invocation;

      // Skip non-result states
      if (state !== "result") return;

      // Skip saveUserInformation calls unless showing all
      if (toolName === "saveUserInformation" && !showAllCalls) {
        // Only keep the first one for display
        if (!grouped[toolName]) {
          grouped[toolName] = [invocation];
        }
        return;
      }

      // Group by tool name
      if (!grouped[toolName]) {
        grouped[toolName] = [];
      }
      grouped[toolName].push(invocation);
    });

    setGroupedCalls(grouped);
  }, [toolInvocations, showAllCalls]);

  // Count total and filtered calls
  const totalCalls = toolInvocations.filter(
    (inv) => inv.state === "result"
  ).length;
  const displayedCalls = Object.values(groupedCalls).flat().length;

  // If no calls to display, return null
  if (Object.keys(groupedCalls).length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Display compact tool call summary */}
      <div className="text-xs text-muted-foreground">
        {displayedCalls < totalCalls && (
          <div className="flex justify-between items-center mb-1">
            <span>
              Showing {displayedCalls} of {totalCalls} tool calls
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={() => setShowAllCalls(!showAllCalls)}
            >
              {showAllCalls ? "Hide repetitive calls" : "Show all calls"}
            </Button>
          </div>
        )}

        {/* Render each group of tool calls */}
        {Object.entries(groupedCalls).map(([toolName, invocations]) => (
          <div key={toolName}>
            {invocations.map((invocation, index) => {
              const { toolCallId, result } = invocation;

              // Special handling for specific tool types
              if (toolName === "getWeather") {
                return <Weather key={toolCallId} weatherAtLocation={result} />;
              } else if (toolName === "createDocument") {
                return (
                  <DocumentPreview
                    key={toolCallId}
                    isReadonly={isReadonly}
                    result={result}
                  />
                );
              } else if (toolName === "updateDocument") {
                return (
                  <DocumentToolResult
                    key={toolCallId}
                    type="update"
                    result={result}
                    isReadonly={isReadonly}
                  />
                );
              } else if (toolName === "requestSuggestions") {
                return (
                  <DocumentToolResult
                    key={toolCallId}
                    type="request-suggestions"
                    result={result}
                    isReadonly={isReadonly}
                  />
                );
              } else {
                // Default compact display for other tool calls
                return (
                  <ToolCallOutput
                    key={toolCallId}
                    toolName={toolName}
                    result={result}
                    index={index}
                    total={invocations.length}
                  />
                );
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Compact tool call output component
const ToolCallOutput = ({
  toolName,
  result,
  index,
  total,
}: {
  toolName: string;
  result: any;
  index: number;
  total: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // For saveUserInformation, show a simplified version
  if (toolName === "saveUserInformation") {
    return (
      <div className="bg-muted/50 p-1.5 rounded-md text-xs flex justify-between items-center">
        <span className="text-muted-foreground">
          {index === 0 && total > 1
            ? `Saved user information (${total} updates)`
            : "Saved user information"}
        </span>
        {isExpanded ? (
          <div className="flex flex-col gap-1 mt-1">
            <div className="text-xs text-muted-foreground">
              {result.message}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-xs h-5 self-end"
            >
              Hide details
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="text-xs h-5"
          >
            Details
          </Button>
        )}
      </div>
    );
  }

  // For other tool calls
  return (
    <div className="bg-muted/50 p-1.5 rounded-md text-xs">
      <div className="flex justify-between items-center">
        <span>{`Tool: ${toolName}`}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs h-5"
        >
          {isExpanded ? "Hide" : "Details"}
        </Button>
      </div>
      {isExpanded && (
        <div className="mt-1 overflow-auto text-muted-foreground">
          {typeof result === "object"
            ? JSON.stringify(result, null, 2)
            : result}
        </div>
      )}
    </div>
  );
};
