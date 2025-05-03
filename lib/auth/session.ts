import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export type SessionPayload = {
  user: {
    id: string;
  };
  expires: string;
};

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // console.log("Failed to verify session");
  }
}

export async function createSession(userId: string) {
  console.log('Creating session for user ID:', userId);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    user: {
      id: userId,
    },
    expires: expires.toISOString(),
  });
  const cookieStore = await cookies();

  // In development, we need to set secure: false for localhost
  const isLocalhost = process.env.NODE_ENV === 'development';

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: !isLocalhost, // Only use secure in production
    expires,
    sameSite: 'lax',
    path: '/',
  });

  console.log('Session cookie set, expires:', expires.toISOString());
}
