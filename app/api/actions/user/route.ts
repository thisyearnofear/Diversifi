import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { userAction, action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Get all user actions
    const userActions = await db
      .select({
        userAction: userAction,
        action: action,
      })
      .from(userAction)
      .leftJoin(action, eq(userAction.actionId, action.id))
      .where(eq(userAction.userId, session.user.id));

    // Format the response
    const formattedActions = userActions.map(({ userAction, action }) => ({
      id: userAction.id,
      actionId: userAction.actionId,
      status: userAction.status,
      startedAt: userAction.startedAt,
      completedAt: userAction.completedAt,
      proof: userAction.proof,
      createdAt: userAction.createdAt,
      updatedAt: userAction.updatedAt,
      action: action
        ? {
            id: action.id,
            title: action.title,
            description: action.description,
            category: action.category,
            chain: action.chain,
            difficulty: action.difficulty,
            prerequisites: action.prerequisites,
            steps: action.steps,
            rewards: action.rewards,
          }
        : null,
    }));

    return NextResponse.json(formattedActions);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get user actions";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
