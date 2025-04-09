import { NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { ActionData } from "@/lib/utils/message-helpers";

// Map of action titles to their URLs
const actionUrls: Record<string, string> = {
  "Set up Farcaster Account": "https://farcaster.xyz",
  "Bridge to Base": "https://bridge.base.org",
  "Mint Celo NFT": "https://nft.celo.org",
  "Swap on Ubeswap": "https://ubeswap.org",
  "Deploy Smart Contract": "https://remix.ethereum.org",
  "Participate in DAO": "https://snapshot.org",
};

// Map of action titles to their proof field labels and placeholders
const proofFields: Record<string, { label: string; placeholder: string }> = {
  "Set up Farcaster Account": {
    label: "Farcaster Username",
    placeholder: "Your Farcaster username",
  },
  "Bridge to Base": {
    label: "Transaction Hash",
    placeholder: "0x...",
  },
  "Mint Celo NFT": {
    label: "NFT URL or ID",
    placeholder: "https://celo.art/nft/...",
  },
  "Swap on Ubeswap": {
    label: "Transaction Hash",
    placeholder: "0x...",
  },
  "Deploy Smart Contract": {
    label: "Contract Address",
    placeholder: "0x...",
  },
  "Participate in DAO": {
    label: "Transaction Hash or Proposal ID",
    placeholder: "0x... or proposal ID",
  },
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const title = url.searchParams.get("title");
    const limit = parseInt(url.searchParams.get("limit") || "3");

    console.log("Chat actions request:", { category, title, limit });

    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const conditions = [];

    if (category) {
      const validChain = category.toUpperCase() as "BASE" | "CELO" | "ETHEREUM";
      conditions.push(eq(action.chain, validChain));
    }

    if (title) {
      conditions.push(eq(action.title, title));
    }

    const actions = await db
      .select()
      .from(action)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit);

    console.log(
      `Found ${actions.length} actions for category: ${category || "all"}`
    );

    // If no actions found, return some default actions
    if (actions.length === 0) {
      console.log("No actions found, returning default actions");
      return NextResponse.json([
        {
          title: "Bridge to Base",
          description: "Bridge assets from Ethereum to Base",
          chain: category || "BASE",
          difficulty: "beginner",
          steps: ["Visit bridge.base.org", "Connect wallet", "Select amount"],
          reward: "0.1 ETH",
          actionUrl: "https://bridge.base.org",
          proofFieldLabel: "Transaction Hash",
          proofFieldPlaceholder: "0x...",
        },
      ]);
    }

    // Convert to ActionData format
    const actionData: ActionData[] = actions.map((a) => {
      const steps =
        (a.steps as any[])?.map((step) =>
          typeof step === "string" ? step : step.title || step.description || ""
        ) || [];

      const reward = (a.rewards as any[])?.[0]?.description || "Rewards";

      return {
        title: a.title,
        description: a.description,
        chain: a.chain,
        difficulty: a.difficulty,
        steps,
        reward,
        actionUrl: actionUrls[a.title] || "#",
        proofFieldLabel: proofFields[a.title]?.label || "Proof",
        proofFieldPlaceholder:
          proofFields[a.title]?.placeholder || "Provide proof of completion",
      };
    });

    return NextResponse.json(actionData);
  } catch (error) {
    console.error("Failed to get chat actions:", error);
    return NextResponse.json(
      { error: "Failed to get chat actions" },
      { status: 500 }
    );
  }
}
