'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';
import { useAuth } from "@/hooks/use-auth";
interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const { isAuthenticated } = useAuth();
  const suggestedActions = [
    {
      title: "How can I get started on Ethereum?",
      label: "I am new to web3",
      action:
        "I want to get started on Ethereum, what's the best way to do that?",
    },
    {
      title: "I want to help others get onchain",
      label: "Can you help?",
      action: `I want to help others get onchain, can I buy a starter kit as a gift?`,
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              if (isAuthenticated) {
                window.history.replaceState({}, "", `/chat/${chatId}`);
              }

              append({
                role: "user",
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
