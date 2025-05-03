import { verifySiwe } from '@/app/auth-actions';

export async function POST(request: Request) {
  const { message, signature } = await request.json();

  try {
    const result = await verifySiwe(message, signature as `0x${string}`);

    if (result.status === 'failed') {
      return new Response('Verification failed', { status: 400 });
    }

    // Return response with the original Set-Cookie header
    return new Response(JSON.stringify({ ok: true }), {});
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Verification failed';
    return new Response(errorMessage, { status: 400 });
  }
}
