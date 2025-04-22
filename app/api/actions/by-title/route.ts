import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/connection";
import { action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const actions = await db
      .select()
      .from(action)
      .where(eq(action.title, title))
      .limit(1);

    if (actions.length === 0) {
      console.log(`Action with title "${title}" not found in database`);

      // For certain actions, we'll create a fallback response
      if (title === "Register on Optimism" || title === "Get EURA Stablecoins" || title === "Get cKES Stablecoins") {
        // Return a synthetic action for these known actions
        return NextResponse.json({
          id: `synthetic-${Date.now()}`,
          title: title,
          description: `${title} action`,
          category: "STABLECOIN",
          chain: title.includes("Optimism") ? "OPTIMISM" : "CELO",
          difficulty: "BEGINNER",
          prerequisites: [],
          steps: [],
          rewards: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json(actions[0]);
  } catch (error) {
    console.error("Error in /api/actions/by-title:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to get action by title";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
