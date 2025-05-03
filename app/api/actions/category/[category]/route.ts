import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { action } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const categoryToChain = {
  'social-actions': 'BASE',
  'stable-actions': 'CELO',
  'global-actions': 'ETHEREUM',
} as const;

export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const chain =
      categoryToChain[params.category as keyof typeof categoryToChain];

    if (!chain) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 },
      );
    }

    const actions = await db
      .select()
      .from(action)
      .where(eq(action.chain, chain));

    return NextResponse.json(actions);
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to get actions by category';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
