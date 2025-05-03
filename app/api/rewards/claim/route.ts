import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { db } from '@/lib/db/queries';
import { userReward } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json(
        { error: 'rewardId is required' },
        { status: 400 },
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    // Check if the reward exists and belongs to the user
    const existingReward = await db
      .select()
      .from(userReward)
      .where(
        and(
          eq(userReward.id, rewardId),
          eq(userReward.userId, session.user.id),
        ),
      )
      .limit(1);

    if (existingReward.length === 0) {
      return NextResponse.json(
        { error: 'Reward not found or not owned by user' },
        { status: 404 },
      );
    }

    if (existingReward[0].claimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 400 },
      );
    }

    // Update the reward to mark it as claimed
    await db
      .update(userReward)
      .set({
        claimed: true,
        claimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userReward.id, rewardId));

    // In a real implementation, we would also handle the actual reward distribution here
    // For example, sending tokens, minting NFTs, etc.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to claim reward:', error);
    return NextResponse.json(
      { error: 'Failed to claim reward' },
      { status: 500 },
    );
  }
}
