import { Button } from "./ui/button";
import { FundButton } from "@coinbase/onchainkit/fund";
import { ConnectButton } from "./connect-button";
import { useState, useCallback, useRef } from "react";
import type { UserAction } from "@/lib/utils/message-helpers";
import { useChatContext } from "@/contexts/chat-context";

interface ActionButtonsProps {
  args: Array<Record<string, any>>;
  chatId: string;
}

function ActionButtons({ args, chatId }: ActionButtonsProps) {
  const { setInput, submitForm, append } = useChatContext();

  const handleSelect = useCallback(
    (option: Record<string, any>) => {
      append({
        role: "user",
        content: option.label,
      });
    },
    [append]
  );

  return (
    <div className="flex flex-col gap-2">
      {args.map((arg) => (
        <Button
          key={arg.value}
          variant={arg.value === "selected" ? "default" : "outline"}
          onClick={() => handleSelect(arg)}
          className="justify-start"
        >
          <div className="text-left">
            <div>{arg.label}</div>
            {arg.description && (
              <div className="text-sm text-muted-foreground">
                {arg.description}
              </div>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}

interface InteractiveElementProps {
  actions: UserAction[];
  chatId: string;
}

export function InteractiveElement({
  actions,
  chatId,
}: InteractiveElementProps) {
  const { setInput, submitForm } = useChatContext();

  const handleAction = useCallback(
    (action: UserAction) => {
      setInput(action.label || action.action);

      setTimeout(() => {
        submitForm();
      }, 100);
    },
    [setInput, submitForm]
  );

  // Find the first action that matches each type
  const connectWalletAction = actions.find(
    (a) => a.action === "connect-wallet"
  );
  const fundWalletAction = actions.find((a) => a.action === "fund-wallet");
  const transactionAction = actions.find((a) => a.action === "transaction");
  const optionsAction = actions.find((a) => a.action === "options");
  const helpAction = actions.find((a) => a.action === "help");

  return (
    <div className="flex flex-col gap-4">
      {connectWalletAction && <ConnectButton />}

      {fundWalletAction && <FundButton />}

      {transactionAction && transactionAction.args && (
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <h3 className="font-medium">Transaction Details</h3>
          <div className="text-sm text-muted-foreground">
            <p>To: {transactionAction.args[0].to}</p>
            <p>Value: {transactionAction.args[0].value} ETH</p>
          </div>
          <Button
            onClick={() =>
              handleAction({
                ...transactionAction,
                action: "confirm-transaction",
              })
            }
          >
            Confirm Transaction
          </Button>
        </div>
      )}

      {optionsAction && optionsAction.args && (
        <ActionButtons args={optionsAction.args} chatId={chatId} />
      )}

      {helpAction && (
        <Button
          variant="outline"
          onClick={() => handleAction({ action: "help" })}
        >
          {helpAction.label || "Help, I don't understand"}
        </Button>
      )}
    </div>
  );
}
