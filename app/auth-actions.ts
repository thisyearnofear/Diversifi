'use server';

import { cookies } from 'next/headers';

import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';

import {
  createSiweMessage,
  verifySiweMessage,
  generateSiweNonce,
  parseSiweMessage,
} from 'viem/siwe';
import {
  createSession,
  decrypt,
  type SessionPayload,
} from '@/lib/auth/session';
import { createUserIfNotExists } from '@/lib/db/queries';

const chain =
  process.env.NEXT_PUBLIC_ACTIVE_CHAIN === 'base' ? base : baseSepolia;
// Ensure we have a properly formatted domain and URI for SIWE
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const domain = appUrl.replace(/^https?:\/\//, '');
const uri = appUrl;

console.log('SIWE configuration:', { domain, uri, chainId: chain.id });

export const generateSiweChallenge = async (address: `0x${string}`) => {
  try {
    console.log(`Generating SIWE challenge for address: ${address}`);
    const nonce = generateSiweNonce();
    const cookieStore = await cookies();
    cookieStore.set('nonce', nonce);

    const message = createSiweMessage({
      nonce,
      address,
      domain,
      uri,
      version: '1',
      chainId: chain.id,
      statement: 'Sign in to Stable Station',
    });

    console.log('Generated SIWE message:', {
      domain,
      uri,
      address: `${address.slice(0, 6)}...${address.slice(-4)}`,
      chainId: chain.id,
      messageLength: message.length,
    });

    return message;
  } catch (error) {
    console.error('Error generating SIWE challenge:', error);
    throw error;
  }
};

const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export const verifySiwe = async (message: string, signature: `0x${string}`) => {
  try {
    console.log('Verifying SIWE message:', {
      messagePreview: `${message.substring(0, 50)}...`,
      signature: `${signature.slice(0, 10)}...`,
    });

    const cookieStore = await cookies();
    const nonce = cookieStore.get('nonce');
    if (!nonce) {
      console.error('SIWE verification failed: No nonce found in cookies');
      return { status: 'failed', error: 'No nonce found' };
    }

    // Parse the SIWE message to extract domain and other details
    const parsedMessage = parseSiweMessage(message);

    // Log the parsed message details for debugging
    console.log('Parsed SIWE message:', {
      domain: parsedMessage.domain,
      uri: parsedMessage.uri,
      address: parsedMessage.address
        ? `${parsedMessage.address.slice(0, 6)}...${parsedMessage.address.slice(-4)}`
        : 'undefined',
      chainId: parsedMessage.chainId,
      nonce: parsedMessage.nonce,
      issuedAt: parsedMessage.issuedAt,
      version: parsedMessage.version,
    });

    // Check if the domain in the message matches our expected domain
    if (parsedMessage.domain !== domain) {
      console.error(
        `SIWE domain mismatch: Expected '${domain}', got '${parsedMessage.domain}'`,
      );
      return {
        status: 'failed',
        error: `Domain mismatch: Expected '${domain}', got '${parsedMessage.domain}'`,
      };
    }

    if (!parsedMessage.address) {
      console.error('SIWE verification failed: No address in parsed message');
      return { status: 'failed', error: 'No address in message' };
    }

    try {
      // Verify the signature
      const verified = await verifySiweMessage(publicClient, {
        message,
        signature,
      });

      console.log('SIWE verification result:', verified);

      if (!verified) {
        console.error(
          'SIWE verification failed: Signature verification failed',
        );
        return { status: 'failed', error: 'Signature verification failed' };
      }

      // Ensure user exists in database before creating session
      await createUserIfNotExists(parsedMessage.address);

      // Create session and explicitly set cookie
      // Clear any existing session first to avoid conflicts
      const cookieStore = await cookies();
      cookieStore.delete('session');

      // Create a new session
      await createSession(parsedMessage.address);
      console.log('Session created for address:', parsedMessage.address);

      return { status: 'success', address: parsedMessage.address };
    } catch (verifyError) {
      console.error('SIWE verification error:', verifyError);
      const errorMessage =
        verifyError instanceof Error ? verifyError.message : 'Unknown error';
      return { status: 'failed', error: `Verification error: ${errorMessage}` };
    }
  } catch (error) {
    console.error('Error verifying SIWE:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { status: 'failed', error: `General error: ${errorMessage}` };
  }
};

export const auth = async () => {
  console.log('Checking authentication state...');
  const cookieStore = await cookies();
  const session = cookieStore.get('session');

  if (!session) {
    console.log('No session cookie found');
    return { user: undefined, expires: '' };
  }

  console.log('Session cookie found, decrypting...');
  const payload = await decrypt(session.value);

  if (!payload || !isSessionPayload(payload)) {
    console.log('Invalid session payload:', payload);
    return { user: undefined, expires: '' };
  }

  if (new Date(payload.expires) < new Date()) {
    console.log('Session expired, logging out');
    await logout();
    return { user: undefined, expires: '' };
  }

  console.log('Valid session found for user:', payload.user.id);
  return payload;
};

function isSessionPayload(payload: any): payload is SessionPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'user' in payload &&
    typeof payload.user === 'object' &&
    'id' in payload.user &&
    typeof payload.user.id === 'string' &&
    'expires' in payload &&
    typeof payload.expires === 'string'
  );
}

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('session');
};
