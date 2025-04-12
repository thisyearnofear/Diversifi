import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { action, userAction } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/auth";

/**
 * POST handler for completing Celo actions
 * @param request The request object
 * @returns JSON response with completion status
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { actionId, transactionHash } = await request.json();

    if (!actionId || !transactionHash) {
      return NextResponse.json(
        { error: "Action ID and transaction hash are required" },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!db) {
      console.warn("⚠️ Database not available. Cannot complete action.");
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Get the action from the database
    const actions = await db
      .select()
      .from(action)
      .where(eq(action.id, actionId))
      .limit(1);

    if (actions.length === 0) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 }
      );
    }

    // Record the action completion
    const now = new Date();
    await db.insert(userAction).values({
      userId: session.user.id,
      actionId,
      status: "COMPLETED",
      completedAt: now,
      proof: {
        transactionHash,
      },
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      message: "Action completed successfully",
    });
  } catch (error) {
    console.error("Error completing Celo action:", error);
    return NextResponse.json(
      { error: "Failed to complete action" },
      { status: 500 }
    );
  }
}
