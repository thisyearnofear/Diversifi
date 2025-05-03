import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { db } from '@/lib/db/queries';
import { starterKit, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'You must be authenticated to request a starter kit' },
      { status: 401 },
    );
  }

  // Check if the database connection is available
  if (!db) {
    return NextResponse.json(
      { error: 'Database connection not available' },
      { status: 500 },
    );
  }

  try {
    // Check if the user already has a claimed starter kit
    const existingKits = await db
      .select()
      .from(starterKit)
      .where(eq(starterKit.claimerId, session.user.id));

    if (existingKits.length > 0) {
      return NextResponse.json(
        { message: 'You already have a starter kit', kit: existingKits[0] },
        { status: 200 },
      );
    }

    // First, make sure the user exists in the database
    const now = new Date();

    try {
      // Try to create the user first (will fail silently if user already exists)
      await db
        .insert(user)
        .values({
          id: session.user.id,
        })
        .onConflictDoNothing();

      // Create a new starter kit for the user
      // Use the user's own address as both creator and claimer
      const newKit = await db
        .insert(starterKit)
        .values({
          creatorId: session.user.id, // Use the user's address as creator
          claimerId: session.user.id,
          createdAt: now,
          claimedAt: now,
          value: 100, // Default value
          balance: 0,
        })
        .returning();

      return NextResponse.json(
        { message: 'Starter kit created successfully', kit: newKit[0] },
        { status: 201 },
      );
    } catch (error) {
      console.error('Error creating starter kit:', error);
      return NextResponse.json(
        { error: 'Failed to create starter kit' },
        { status: 500 },
      );
    }

    // This return is unreachable due to the try/catch above
  } catch (error) {
    console.error('Error creating starter kit:', error);
    return NextResponse.json(
      { error: 'Failed to create starter kit' },
      { status: 500 },
    );
  }
}
