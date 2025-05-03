import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { starterKit } from '@/lib/db/schema';

// This is a simple admin endpoint to create starter kits for testing
// In production, you would want to secure this endpoint
export async function POST(request: Request) {
  try {
    const { creatorId, value } = await request.json();

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId is required' },
        { status: 400 },
      );
    }

    // Check if the database connection is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    // Create a new starter kit
    const newKit = await db
      .insert(starterKit)
      .values({
        creatorId,
        value: value || 100, // Default value
        balance: 0,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({ kit: newKit[0] });
  } catch (error) {
    console.error('Failed to create starter kit:', error);
    return NextResponse.json(
      { error: 'Failed to create starter kit' },
      { status: 500 },
    );
  }
}
