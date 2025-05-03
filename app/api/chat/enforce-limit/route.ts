import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { chat } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/app/auth';

// Maximum number of chats to keep per user
const MAX_CHATS = 3;

export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    // Get all chats for the user, ordered by creation date (newest first)
    const userChats = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt));

    // If the user has more chats than the limit, delete the oldest ones
    if (userChats.length > MAX_CHATS) {
      const chatsToDelete = userChats.slice(MAX_CHATS);

      for (const chatToDelete of chatsToDelete) {
        await db.delete(chat).where(eq(chat.id, chatToDelete.id));
      }

      return NextResponse.json({
        success: true,
        deleted: chatsToDelete.length,
        remaining: MAX_CHATS,
      });
    }

    return NextResponse.json({
      success: true,
      deleted: 0,
      remaining: userChats.length,
    });
  } catch (error) {
    console.error('Error enforcing chat limit:', error);
    return NextResponse.json(
      { error: 'Failed to enforce chat limit' },
      { status: 500 },
    );
  }
}
