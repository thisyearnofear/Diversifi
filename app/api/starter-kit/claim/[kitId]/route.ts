import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { claimStarterKit } from '@/lib/db/queries';

export async function POST(request: Request, context: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = context.params;
  const { kitId } = params;

  try {
    await claimStarterKit({
      kitId: kitId,
      userId: session.user.id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to claim starter kit:', error);
    return NextResponse.json(
      { error: 'Failed to claim starter kit' },
      { status: 500 },
    );
  }
}
