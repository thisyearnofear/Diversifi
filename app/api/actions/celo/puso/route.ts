import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { getDb } from "@/lib/db/connection";
import { action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the PUSO action from the database
    const db = getDb();
    if (!db) {
      return new NextResponse("Database not available", { status: 500 });
    }
    
    const actions = await db
      .select()
      .from(action)
      .where(eq(action.title, "Get PUSO Stablecoins"));

    if (actions.length === 0) {
      return new NextResponse("Action not found", { status: 404 });
    }

    // Return action data
    return NextResponse.json(actions[0]);
  } catch (error) {
    console.error("[CELO_PUSO_ACTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
