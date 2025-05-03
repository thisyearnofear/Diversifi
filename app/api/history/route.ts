import { auth } from '@/app/auth';
import { getChatsByUserId } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chats = await getChatsByUserId({ userId: session.user.id });
    return Response.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
