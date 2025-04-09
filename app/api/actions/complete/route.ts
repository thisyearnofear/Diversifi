import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { userAction, userReward, action } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { actionId, proof } = await request.json();

    if (!actionId) {
      return NextResponse.json(
        { error: "actionId is required" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Check if the user has already completed this action
    const existingUserAction = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, actionId)
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
        actionId,
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
      .where(eq(action.id, actionId))
      .limit(1);

    // Create rewards for the user
    if (actionDetails.length > 0 && actionDetails[0].rewards) {
      const rewards = actionDetails[0].rewards as any[];
      for (const reward of rewards) {
        await db.insert(userReward).values({
          userId: session.user.id,
          actionId,
          type: reward.type,
          details: reward,
          claimed: false,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to complete action";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
