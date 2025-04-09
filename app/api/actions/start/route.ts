import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { userAction } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { actionId } = await request.json();

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

    // Check if the user has already started this action
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

    if (existingUserAction.length > 0) {
      return NextResponse.json(
        { error: "Action already started" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Create a new user action
    await db.insert(userAction).values({
      userId: session.user.id,
      actionId,
      status: "IN_PROGRESS",
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to start action";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
