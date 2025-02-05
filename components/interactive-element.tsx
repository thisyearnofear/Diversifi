import { Button } from "./ui/button";
import { WalletDefault } from "@coinbase/onchainkit/wallet";
import { FundButton } from "@coinbase/onchainkit/fund";
import { ConnectButton } from "./connect-button";
import { useState, useCallback } from "react";
import { Message } from "ai";

interface Option {
  label: string;
  value: string;
  description?: string;
}

interface InteractiveElementProps {
  type: "connect-wallet" | "fund-wallet" | "transaction" | "options" | "help";
  options?: Option[];
  transactionData?: {
    to: string;
    value: string;
    data?: string;
  };
  onSelect?: (value: string) => void;
  onComplete?: () => void;
  onHelp?: () => void;
}

export function InteractiveElement({
  type,
  options,
  transactionData,
  onSelect,
  onComplete,
  onHelp,
}: InteractiveElementProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback(
    (value: string) => {
      setSelected(value);
      onSelect?.(value);
    },
    [onSelect]
  );

  switch (type) {
    case "connect-wallet":
      return <ConnectButton />;

    case "fund-wallet":
      return <FundButton />;

    case "transaction":
      return (
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <h3 className="font-medium">Transaction Details</h3>
          <div className="text-sm text-muted-foreground">
            <p>To: {transactionData?.to}</p>
            <p>Value: {transactionData?.value} ETH</p>
          </div>
          <Button onClick={onComplete}>Confirm Transaction</Button>
        </div>
      );

    case "options":
      return (
        <div className="flex flex-col gap-2">
          {options?.map((option) => (
            <Button
              key={option.value}
              variant={selected === option.value ? "default" : "outline"}
              onClick={() => handleSelect(option.value)}
              className="justify-start"
            >
              <div className="text-left">
                <div>{option.label}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      );

    case "help":
      return (
        <Button variant="outline" onClick={onHelp}>
          Help, I don&apos;t understand
        </Button>
      );

    default:
      return null;
  }
}
