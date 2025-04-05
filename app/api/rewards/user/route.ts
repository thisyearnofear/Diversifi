import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { userReward, action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all user rewards
    const userRewards = await db
      .select({
        userReward: userReward,
        action: action,
      })
      .from(userReward)
      .leftJoin(action, eq(userReward.actionId, action.id))
      .where(eq(userReward.userId, session.user.id));

    // Format the response
    const formattedRewards = userRewards.map(({ userReward, action }) => ({
      id: userReward.id,
      actionId: userReward.actionId,
      type: userReward.type,
      details: userReward.details,
      claimed: userReward.claimed,
      claimedAt: userReward.claimedAt,
      createdAt: userReward.createdAt,
      updatedAt: userReward.updatedAt,
      action: action ? {
        id: action.id,
        title: action.title,
        description: action.description,
        category: action.category,
        chain: action.chain,
        difficulty: action.difficulty,
      } : null,
    }));

    return NextResponse.json(formattedRewards);
  } catch (error) {
    console.error("Failed to get user rewards:", error);
    return NextResponse.json(
      { error: "Failed to get user rewards" },
      { status: 500 }
    );
  }
}
