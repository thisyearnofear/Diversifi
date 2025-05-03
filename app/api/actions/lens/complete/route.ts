import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { action, userAction } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/app/auth';

export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    // Get the request body
    const body = await request.json();
    const { proofUrl } = body;

    if (!proofUrl) {
      return NextResponse.json(
        { error: 'Proof URL is required' },
        { status: 400 },
      );
    }

    // Find the Lens action
    const lensActions = await db
      .select()
      .from(action)
      .where(eq(action.title, 'Set up Lens Account'));

    // If no Lens action is found, create a default one
    let lensAction;

    if (lensActions.length === 0) {
      console.log('Creating default Lens action');

      // Create a default Lens action
      const newActions = await db
        .insert(action)
        .values({
          title: 'Set up Lens Account',
          description:
            'Create a Lens account and join the decentralized social network',
          category: 'SOCIAL',
          chain: 'BASE', // Using BASE as a fallback
          difficulty: 'BEGINNER',
          prerequisites: [],
          steps: [
            'Go to https://onboarding.lens.xyz and sign up',
            'Connect your wallet',
            'Create your profile',
            'Copy your profile URL (e.g. https://hey.xyz/u/username)',
          ],
          rewards: [
            {
              type: 'SOCIAL',
              description: 'Access to the Lens ecosystem',
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      lensAction = newActions[0];
    } else {
      lensAction = lensActions[0];
    }

    // Check if the user has already completed this action
    const existingCompletions = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, lensAction.id),
          eq(userAction.status, 'COMPLETED'),
        ),
      );

    if (existingCompletions.length > 0) {
      return NextResponse.json(
        {
          message: 'Action already completed',
          completion: existingCompletions[0],
        },
        { status: 200 },
      );
    }

    // Save the completion
    const completion = await db
      .insert(userAction)
      .values({
        userId: session.user.id,
        actionId: lensAction.id,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        proof: { url: proofUrl },
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Action completed successfully',
        completion: completion[0],
      },
      { status: 201 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to complete action';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get the user session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    // Find the Lens action
    const lensActions = await db
      .select()
      .from(action)
      .where(eq(action.title, 'Set up Lens Account'));

    // If no Lens action is found, create a default one
    let lensAction;

    if (lensActions.length === 0) {
      console.log('Creating default Lens action');

      // Create a default Lens action
      const newActions = await db
        .insert(action)
        .values({
          title: 'Set up Lens Account',
          description:
            'Create a Lens account and join the decentralized social network',
          category: 'SOCIAL',
          chain: 'BASE', // Using BASE as a fallback
          difficulty: 'BEGINNER',
          prerequisites: [],
          steps: [
            'Go to https://onboarding.lens.xyz and sign up',
            'Connect your wallet',
            'Create your profile',
            'Copy your profile URL (e.g. https://hey.xyz/u/username)',
          ],
          rewards: [
            {
              type: 'SOCIAL',
              description: 'Access to the Lens ecosystem',
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      lensAction = newActions[0];
    } else {
      lensAction = lensActions[0];
    }

    // Check if the user has already completed this action
    const existingCompletions = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, lensAction.id),
          eq(userAction.status, 'COMPLETED'),
        ),
      );

    if (existingCompletions.length > 0) {
      return NextResponse.json(
        {
          completed: true,
          completion: existingCompletions[0],
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        completed: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error checking Lens action completion:', error);
    return NextResponse.json(
      { error: 'Failed to check action completion' },
      { status: 500 },
    );
  }
}
