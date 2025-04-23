import { NextResponse } from "next/server";
import { db, deleteChatById, getChatById } from "@/lib/db/queries";
import { chat } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/auth";

// PATCH - Update chat title
export async function PATCH(request: Request, context: any) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const id = context.params.id;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Check if the chat exists and belongs to the user
    const existingChat = await getChatById({ id });
    if (!existingChat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    if (existingChat.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update the chat title
    await db
      .update(chat)
      .set({ title })
      .where(eq(chat.id, id));

    return NextResponse.json({
      success: true,
      message: "Chat title updated successfully"
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { error: "Failed to update chat title" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a chat
export async function DELETE(request: Request, context: any) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = context.params.id;

    // Check if the chat exists and belongs to the user
    const existingChat = await getChatById({ id });
    if (!existingChat) {
      return NextResponse.json(
        { error: "Chat not found" },
        { status: 404 }
      );
    }

    if (existingChat.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the chat
    await deleteChatById({ id });

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
