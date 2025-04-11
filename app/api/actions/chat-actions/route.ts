import { NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { ActionData } from "@/lib/utils/message-helpers";

// Map of action titles to their URLs
const actionUrls: Record<string, string> = {
  "Set up Farcaster Account": "https://farcaster.xyz",
  "Set up Lens Account": "https://onboarding.lens.xyz",
  "Mint Celo NFT": "https://nft.celo.org",
  "Swap on Ubeswap": "https://ubeswap.org",
  "Deploy Smart Contract": "https://remix.ethereum.org",
  "Participate in DAO": "https://snapshot.org",
};

// Map of action titles to their proof field labels and placeholders
const proofFields: Record<string, { label: string; placeholder: string }> = {
  "Set up Farcaster Account": {
    label: "Farcaster Profile URL",
    placeholder: "https://warpcast.com/yourusername",
  },
  "Set up Lens Account": {
    label: "Lens Profile URL",
    placeholder: "https://hey.xyz/u/yourusername",
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
          title: "Set up Lens Account",
          description: "Create a Lens account and join the decentralized social network",
          chain: category || "BASE",
          difficulty: "beginner",
          steps: ["Go to onboarding.lens.xyz", "Connect wallet", "Create profile"],
          reward: "Access to the Lens ecosystem",
          actionUrl: "https://onboarding.lens.xyz",
          proofFieldLabel: "Lens Profile URL",
          proofFieldPlaceholder: "https://hey.xyz/u/yourusername",
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
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get chat actions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
