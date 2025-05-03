import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { claimStarterKit, getCreatedStarterKits } from '@/lib/db/queries';

export async function POST(request: Request, context: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = context.params;
  const { kitId, recipientId } = params;

  try {
    // Verify ownership
    const kits = await getCreatedStarterKits(session.user.id);
    const kit = kits.find((k) => k.id === kitId);

    if (!kit) {
      return NextResponse.json(
        { error: 'Starter kit not found or not owned by user' },
        { status: 404 },
      );
    }

    await claimStarterKit({
      kitId,
      userId: recipientId,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to give starter kit:', error);
    return NextResponse.json(
      { error: 'Failed to give starter kit' },
      { status: 500 },
    );
  }
}
