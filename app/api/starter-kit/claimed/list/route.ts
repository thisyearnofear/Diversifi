import { auth } from '@/app/auth';
import { getClaimedStarterKits } from '@/lib/db/queries';
import {
  handleUnauthorized,
  handleSuccess,
  handleApiError,
} from '@/lib/api/errors';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return handleUnauthorized();
  }

  try {
    const kits = await getClaimedStarterKits(session.user.id);
    return handleSuccess({ kits });
  } catch (error) {
    return handleApiError(error, 'Failed to list claimed starter kits');
  }
}
