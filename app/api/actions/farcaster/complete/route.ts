import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { db } from "@/lib/db/queries";
import { action, userAction } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { proofUrl } = body;

    if (!proofUrl) {
      return NextResponse.json(
        { error: "Proof URL is required" },
        { status: 400 }
      );
    }

    // Find the Farcaster action
    const farcasterActions = await db
      .select()
      .from(action)
      .where(eq(action.title, "Set up Farcaster Account"));

    // If no Farcaster action is found, create a default one
    let farcasterAction;

    if (farcasterActions.length === 0) {
      console.log("Creating default Farcaster action");

      // Create a default Farcaster action
      const newActions = await db
        .insert(action)
        .values({
          title: "Set up Farcaster Account",
          description: "Create a Farcaster account and join the decentralized social network",
          category: "SOCIAL",
          chain: "BASE",
          difficulty: "BEGINNER",
          prerequisites: [],
          steps: [
            "Go to https://www.farcaster.xyz on mobile and sign up",
            "Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC",
            "Say hi to @papa as your first cast",
            "Copy your profile URL (e.g. https://warpcast.com/papa)"
          ],
          rewards: [
            {
              type: "SOCIAL",
              description: "Starter packs from the community"
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      farcasterAction = newActions[0];
    } else {
      farcasterAction = farcasterActions[0];
    }

    // This line is now handled in the block above

    // Check if the user has already completed this action
    const existingCompletions = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, farcasterAction.id),
          eq(userAction.status, "COMPLETED")
        )
      );

    if (existingCompletions.length > 0) {
      return NextResponse.json(
        {
          message: "Action already completed",
          completion: existingCompletions[0],
        },
        { status: 200 }
      );
    }

    // Save the completion
    const completion = await db
      .insert(userAction)
      .values({
        userId: session.user.id,
        actionId: farcasterAction.id,
        status: "COMPLETED",
        startedAt: new Date(),
        completedAt: new Date(),
        proof: { url: proofUrl },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        message: "Action completed successfully",
        completion: completion[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error completing Farcaster action:", error);
    return NextResponse.json(
      { error: "Failed to complete action" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Find the Farcaster action
    const farcasterActions = await db
      .select()
      .from(action)
      .where(eq(action.title, "Set up Farcaster Account"));

    // If no Farcaster action is found, create a default one
    let farcasterAction;

    if (farcasterActions.length === 0) {
      console.log("Creating default Farcaster action");

      // Create a default Farcaster action
      const newActions = await db
        .insert(action)
        .values({
          title: "Set up Farcaster Account",
          description: "Create a Farcaster account and join the decentralized social network",
          category: "SOCIAL",
          chain: "BASE",
          difficulty: "BEGINNER",
          prerequisites: [],
          steps: [
            "Go to https://www.farcaster.xyz on mobile and sign up",
            "Use an invite code e.g. EC235BN6F, MFRACUEJK, T3QOBXWTC",
            "Say hi to @papa as your first cast",
            "Copy your profile URL (e.g. https://warpcast.com/papa)"
          ],
          rewards: [
            {
              type: "SOCIAL",
              description: "Starter packs from the community"
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      farcasterAction = newActions[0];
    } else {
      farcasterAction = farcasterActions[0];
    }

    // Check if the user has already completed this action
    const existingCompletions = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, farcasterAction.id),
          eq(userAction.status, "COMPLETED")
        )
      );

    if (existingCompletions.length > 0) {
      return NextResponse.json(
        {
          completed: true,
          completion: existingCompletions[0],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        completed: false,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking Farcaster action completion:", error);
    return NextResponse.json(
      { error: "Failed to check action completion" },
      { status: 500 }
    );
  }
}
