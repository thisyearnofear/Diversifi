import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { getDb } from '@/lib/db/connection';
import { action, userAction } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { txHash } = body;

    if (!txHash) {
      return new NextResponse('Transaction hash is required', { status: 400 });
    }

    // Get the PUSO action from the database
    const db = getDb();
    if (!db) {
      return new NextResponse('Database not available', { status: 500 });
    }

    const actions = await db
      .select()
      .from(action)
      .where(eq(action.title, 'Get PUSO Stablecoins'));

    if (actions.length === 0) {
      return new NextResponse('Action not found', { status: 404 });
    }

    const actionId = actions[0].id;

    // Check if the user has already completed this action
    const existingUserActions = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, actionId),
          eq(userAction.status, 'COMPLETED'),
        ),
      );

    if (existingUserActions.length > 0) {
      return NextResponse.json({ message: 'Action already completed' });
    }

    // Create or update the user action
    const existingInProgressActions = await db
      .select()
      .from(userAction)
      .where(
        and(
          eq(userAction.userId, session.user.id),
          eq(userAction.actionId, actionId),
        ),
      );

    if (existingInProgressActions.length > 0) {
      // Update the existing action
      await db
        .update(userAction)
        .set({
          status: 'COMPLETED',
          completedAt: new Date(),
          proof: { transactionHash: txHash },
          updatedAt: new Date(),
        })
        .where(eq(userAction.id, existingInProgressActions[0].id));
    } else {
      // Create a new action
      await db.insert(userAction).values({
        userId: session.user.id,
        actionId,
        status: 'COMPLETED',
        startedAt: new Date(),
        completedAt: new Date(),
        proof: { transactionHash: txHash },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ message: 'Action completed successfully' });
  } catch (error) {
    console.error('[CELO_PUSO_COMPLETE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
