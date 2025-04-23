import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { getDb } from "@/lib/db/connection";
import { userAction, userReward, action } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { actionId, title, proof } = await request.json();

    if (!actionId && !title) {
      return NextResponse.json(
        { error: "Either actionId or title is required" },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // If title is provided, try to find the action by title
    let actionIdToUse = actionId;
    if (title && !actionId) {
      try {
        const actions = await db
          .select()
          .from(action)
          .where(eq(action.title, title))
          .limit(1);

        if (actions.length > 0) {
          actionIdToUse = actions[0].id;
        } else {
          console.log(`Action with title "${title}" not found, creating a synthetic record`);
          // For certain actions, we'll create a synthetic record
          if (title === "Register on Optimism" || title === "Get EURA Stablecoins" || title === "Get cKES Stablecoins" || title === "Get cCOP Stablecoins") {
            // Create a synthetic ID for these known actions
            actionIdToUse = `synthetic-${title.replace(/\s+/g, '-').toLowerCase()}`;
          } else {
            return NextResponse.json({ error: "Action not found" }, { status: 404 });
          }
        }
      } catch (error) {
        console.error("Error finding action by title:", error);
        return NextResponse.json(
          { error: "Failed to find action by title" },
          { status: 500 }
        );
      }
    }

    // Check if the user has already completed this action
    const existingUserAction = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, actionIdToUse)
        )
      )
      .limit(1);

    if (
      existingUserAction.length > 0 &&
      existingUserAction[0].status === "COMPLETED"
    ) {
      return NextResponse.json(
        { error: "Action already completed" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Create or update the user action
    if (existingUserAction.length > 0) {
      await db
        .update(userAction)
        .set({
          status: "COMPLETED",
          completedAt: now,
          proof: proof || null,
          updatedAt: now,
        })
        .where(eq(userAction.id, existingUserAction[0].id));
    } else {
      await db.insert(userAction).values({
        userId: session.user.id,
        actionId: actionIdToUse,
        status: "COMPLETED",
        startedAt: now,
        completedAt: now,
        proof: proof || null,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Get the action to determine rewards
    const actionDetails = await db
      .select()
      .from(action)
      .where(eq(action.id, actionIdToUse))
      .limit(1);

    // Create rewards for the user
    if (actionDetails.length > 0 && actionDetails[0].rewards) {
      const rewards = actionDetails[0].rewards as any[];
      for (const reward of rewards) {
        await db.insert(userReward).values({
          userId: session.user.id,
          actionId: actionIdToUse,
          type: reward.type || 'POINTS', // Default to 'POINTS' if type is not provided
          details: reward,
          claimed: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/actions/complete:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to complete action";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
