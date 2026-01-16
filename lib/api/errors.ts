import 'server-only';

import { NextResponse } from 'next/server';

export type ApiError = {
  message: string;
  status?: number;
  code?: string;
};

/**
 * Handle API errors consistently
 * Logs the error and returns a standardized response
 */
export function handleApiError(error: unknown, defaultMessage: string) {
  const isError = error instanceof Error;
  const message = isError ? error.message : String(error);
  const status = 500;

  // Log the full error for debugging
  console.error(`${defaultMessage}:`, error);

  return NextResponse.json(
    { error: defaultMessage },
    { status },
  );
}

/**
 * Handle unauthorized access
 */
export function handleUnauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 },
  );
}

/**
 * Handle bad request
 */
export function handleBadRequest(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400 },
  );
}

/**
 * Handle not found
 */
export function handleNotFound(message = 'Not found') {
  return NextResponse.json(
    { error: message },
    { status: 404 },
  );
}

/**
 * Return successful response with data
 */
export function handleSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
