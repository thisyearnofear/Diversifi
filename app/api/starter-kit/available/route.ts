import {
  getAvailableStarterKits,
  claimAvailableStarterKit,
} from '@/lib/db/queries';
import {
  handleSuccess,
  handleApiError,
  handleBadRequest,
  handleNotFound,
} from '@/lib/api/errors';

export async function GET() {
  try {
    const kits = await getAvailableStarterKits();
    return handleSuccess({ kits });
  } catch (error) {
    return handleApiError(error, 'Failed to get available starter kits');
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return handleBadRequest('userId is required');
    }

    const kit = await claimAvailableStarterKit(userId);

    if (!kit) {
      return handleNotFound('No starter kits available');
    }

    return handleSuccess({ kit });
  } catch (error) {
    return handleApiError(error, 'Failed to claim starter kit');
  }
}
