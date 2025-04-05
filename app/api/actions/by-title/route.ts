import { NextResponse } from "next/server";
import { db } from "@/lib/db/queries";
import { action } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const actions = await db
      .select()
      .from(action)
      .where(eq(action.title, title))
      .limit(1);

    if (actions.length === 0) {
      return NextResponse.json(
        { error: "Action not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(actions[0]);
  } catch (error) {
    console.error("Failed to get action by title:", error);
    return NextResponse.json(
      { error: "Failed to get action by title" },
      { status: 500 }
    );
  }
}
