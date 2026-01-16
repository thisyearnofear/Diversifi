import { auth } from '@/app/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/queries';
import {
  handleUnauthorized,
  handleBadRequest,
  handleSuccess,
  handleApiError,
} from '@/lib/api/errors';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return handleBadRequest('chatId is required');
  }

  const session = await auth();

  if (!session?.user?.id) {
    return handleUnauthorized();
  }

  try {
    const votes = await getVotesByChatId({ id: chatId });
    return handleSuccess(votes);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch votes');
  }
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return handleBadRequest('chatId, messageId, and type are required');
  }

  const session = await auth();

  if (!session?.user?.id) {
    return handleUnauthorized();
  }

  try {
    await voteMessage({
      chatId,
      messageId,
      type: type,
    });

    return handleSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Failed to vote on message');
  }
}
