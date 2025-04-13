import { Button } from "./ui/button";
import { FundButton } from "@coinbase/onchainkit/fund";
import { ConnectButton } from "./connect-button-new";
import { useCallback } from "react";
import type { UserAction, ActionData } from "@/lib/utils/message-helpers";
import { useChatContext } from "@/contexts/chat-context";
import { StarterKitCheckout } from "./starter-kit-checkout";
import { NFTCard } from "@coinbase/onchainkit/nft";
import { NFTMedia, NFTNetwork, NFTTitle } from "@coinbase/onchainkit/nft/view";
import { ActionMessage } from "./chat/action-message";
import { WalletSetupCompact } from "./chat/wallet-setup-compact";
import { FarcasterActionCardCompact } from "./chat/farcaster-action-card-compact";
import { LensActionCardCompact } from "./chat/lens-action-card-compact";
// Removed import for unused component
import { BaseActionMessage } from "./chat/base-action-message";
import { OptimismActionHandler } from "./chat/optimism-action-handler";
import { CeloActionHandler } from "./chat/celo-action-handler";
import { PolygonActionHandler } from "./chat/polygon-action-handler";

interface ActionButtonsProps {
  args: Array<Record<string, any>>;
  chatId: string;
}

function ActionButtons({ args, chatId }: ActionButtonsProps) {
  const { append } = useChatContext();

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
  const { append } = useChatContext();

  const handleAction = useCallback(
    (message: string) => {
      append({
        role: "user",
        content: message,
      });
    },
    [append]
  );

  // Find the first action that matches each type
  const connectWalletAction = actions.find(
    (a) => a.action === "connect-wallet"
  );
  const fundWalletAction = actions.find((a) => a.action === "fund-wallet");
  const buyStarterKitAction = actions.find(
    (a) => a.action === "buy-starter-kit"
  );
  const giftStarterKitAction = actions.find(
    (a) => a.action === "gift-starter-kit"
  );
  const transactionAction = actions.find((a) => a.action === "transaction");
  const optionsAction = actions.find((a) => a.action === "options");
  const helpAction = actions.find((a) => a.action === "help");
  const showNftActions = actions.filter((a) => a.action === "show-nft");
  const actionCardActions = actions.filter((a) => a.action === "action-card");
  const setupWalletAction = actions.find((a) => a.action === "setup-wallet");
  const baseAction = actions.find((a) => a.action === "base-action");
  const optimismAction = actions.find((a) => a.action === "optimism-action");
  const farcasterAction = actions.find((a) => a.action === "farcaster-action");
  const lensAction = actions.find((a) => a.action === "lens-action");
  // Also check for Farcaster/Lens actions in action-card format
  // Remove any Farcaster/Lens actions from actionCardActions to avoid duplication
  const farcasterActionCard = actionCardActions.find(
    (a) => a.args?.[0]?.chain === "FARCASTER"
  );
  const lensActionCard = actionCardActions.find(
    (a) => a.args?.[0]?.title === "Set up Lens Account"
  );

  // Find Base action card
  const baseActionCard = actionCardActions.find(
    (a) => a.args?.[0]?.title === "Swap to USDbC on Aerodrome"
  );

  // Find Optimism action card
  const optimismActionCard = actionCardActions.find(
    (a) => a.args?.[0]?.title === "Swap to EURA on Velodrome"
  );

  // Find Celo action card
  const celoActionCard = actionCardActions.find(
    (a) => a.args?.[0]?.chain === "CELO"
  );

  // Find Polygon action card
  const polygonActionCard = actionCardActions.find(
    (a) => a.args?.[0]?.chain === "POLYGON"
  );

  // Find dedicated Celo action
  const celoAction = actions.find((a) => a.action === "celo-action");
  const polygonAction = actions.find((a) => a.action === "polygon-action");

  // Filter out Farcaster, Lens, Base, Optimism, Celo, and Polygon actions from actionCardActions to avoid duplication
  const filteredActionCards = actionCardActions.filter(
    (a) =>
      a !== farcasterActionCard &&
      a !== lensActionCard &&
      a !== baseActionCard &&
      a !== optimismActionCard &&
      a !== celoActionCard &&
      a !== polygonActionCard
  );

  return (
    <div className="flex flex-col gap-4">
      {connectWalletAction && <ConnectButton />}

      {fundWalletAction && <FundButton />}

      {buyStarterKitAction && (
        <StarterKitCheckout
          onSuccess={() => {
            console.log("successfully bought a starter kit");
          }}
        />
      )}

      {giftStarterKitAction && (
        <StarterKitCheckout
          isGift={true}
          onSuccess={() => {
            console.log("successfully bought a starter kit as a gift");
          }}
        />
      )}

      {transactionAction?.args && (
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <h3 className="font-medium">Transaction Details</h3>
          <div className="text-sm text-muted-foreground">
            <p>To: {transactionAction.args[0].to}</p>
            <p>Value: {transactionAction.args[0].value} ETH</p>
          </div>
          <Button>Confirm Transaction</Button>
        </div>
      )}

      {optionsAction?.args && (
        <ActionButtons args={optionsAction.args} chatId={chatId} />
      )}

      {helpAction && (
        <Button
          variant="outline"
          onClick={() =>
            handleAction(helpAction.label || "Help, I don't understand")
          }
        >
          {helpAction.label || "Help, I don't understand"}
        </Button>
      )}

      {showNftActions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          {showNftActions.map((action, index) => (
            <NFTCard
              key={`${action.args?.[0].contractAddress}-${action.args?.[0].tokenId}-${index}`}
              contractAddress={action.args?.[0]?.contractAddress}
              tokenId={action.args?.[0]?.tokenId}
            >
              <NFTMedia />
              <NFTTitle />
              <NFTNetwork />
            </NFTCard>
          ))}
        </div>
      )}

      {filteredActionCards.length > 0 && (
        <ActionMessage
          actions={filteredActionCards.map(
            (action) => action.args?.[0] as ActionData
          )}
          onComplete={() => {
            handleAction("I've completed the action!");
          }}
        />
      )}

      {setupWalletAction && <WalletSetupCompact />}

      {/* Handle both dedicated farcaster-action and action-card with FARCASTER chain */}
      {(farcasterAction || farcasterActionCard) && (
        <FarcasterActionCardCompact
          title={
            farcasterAction?.args?.[0]?.title ||
            farcasterActionCard?.args?.[0]?.title ||
            "Set up a Farcaster account"
          }
          description={
            farcasterAction?.args?.[0]?.description ||
            farcasterActionCard?.args?.[0]?.description ||
            "Create a Farcaster account and join the decentralized social network"
          }
          steps={
            farcasterAction?.args?.[0]?.steps ||
            farcasterActionCard?.args?.[0]?.steps || [
              "Go to https://www.farcaster.xyz on mobile and sign up",
              "Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC",
              "Say hi to @papa as your first cast and he will send you starter packs",
            ]
          }
          reward={
            farcasterAction?.args?.[0]?.reward ||
            farcasterActionCard?.args?.[0]?.reward ||
            "Starter packs from @papa"
          }
          actionUrl={
            farcasterAction?.args?.[0]?.actionUrl ||
            farcasterActionCard?.args?.[0]?.actionUrl ||
            "https://www.farcaster.xyz"
          }
          proofFieldLabel={
            farcasterAction?.args?.[0]?.proofFieldLabel ||
            farcasterActionCard?.args?.[0]?.proofFieldLabel ||
            "Your Warpcast URL"
          }
          proofFieldPlaceholder={
            farcasterAction?.args?.[0]?.proofFieldPlaceholder ||
            farcasterActionCard?.args?.[0]?.proofFieldPlaceholder ||
            "https://warpcast.com/yourusername/0x..."
          }
          onComplete={() => {
            handleAction("I've completed the Farcaster action!");
          }}
        />
      )}

      {/* Handle both dedicated base-action and action-card for Base */}
      {(baseAction || baseActionCard) && (
        <BaseActionMessage
          onComplete={() => {
            // No additional message needed
          }}
        />
      )}

      {/* Handle both dedicated optimism-action and action-card for Optimism */}
      {(optimismAction || optimismActionCard) && (
        <OptimismActionHandler
          args={optimismAction?.args || optimismActionCard?.args || []}
        />
      )}

      {/* Handle both dedicated celo-action and action-card for Celo */}
      {(celoAction || celoActionCard) && (
        <CeloActionHandler
          args={celoAction?.args || celoActionCard?.args || []}
        />
      )}

      {/* Handle both dedicated polygon-action and action-card for Polygon */}
      {(polygonAction || polygonActionCard) && (
        <PolygonActionHandler
          args={polygonAction?.args || polygonActionCard?.args || []}
        />
      )}

      {/* Handle both dedicated lens-action and action-card for Lens */}
      {(lensAction || lensActionCard) && (
        <LensActionCardCompact
          title={
            lensAction?.args?.[0]?.title ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).title
              : undefined) ||
            lensActionCard?.args?.[0]?.title ||
            "Set up a Lens account"
          }
          description={
            lensAction?.args?.[0]?.description ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).description
              : undefined) ||
            lensActionCard?.args?.[0]?.description ||
            "Create a Lens account and join the decentralized social network"
          }
          steps={
            lensAction?.args?.[0]?.steps ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).steps
              : undefined) ||
            lensActionCard?.args?.[0]?.steps || [
              "Go to https://onboarding.lens.xyz and sign up",
              "Connect your wallet",
              "Create your profile",
              "Copy your profile URL (e.g. https://hey.xyz/u/username)",
            ]
          }
          reward={
            lensAction?.args?.[0]?.reward ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).reward
              : undefined) ||
            lensActionCard?.args?.[0]?.reward ||
            "Access to the Lens ecosystem"
          }
          actionUrl={
            lensAction?.args?.[0]?.actionUrl ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).actionUrl
              : undefined) ||
            lensActionCard?.args?.[0]?.actionUrl ||
            "https://onboarding.lens.xyz"
          }
          proofFieldLabel={
            lensAction?.args?.[0]?.proofFieldLabel ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).proofFieldLabel
              : undefined) ||
            lensActionCard?.args?.[0]?.proofFieldLabel ||
            "Your Lens Profile URL"
          }
          proofFieldPlaceholder={
            lensAction?.args?.[0]?.proofFieldPlaceholder ||
            (lensAction?.args?.[0] && typeof lensAction.args[0] === "string"
              ? JSON.parse(lensAction.args[0]).proofFieldPlaceholder
              : undefined) ||
            lensActionCard?.args?.[0]?.proofFieldPlaceholder ||
            "https://hey.xyz/u/yourusername"
          }
          onComplete={() => {
            handleAction("I've completed the Lens action!");
          }}
        />
      )}
    </div>
  );
}
