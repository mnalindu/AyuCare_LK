import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/http-client';
import {
  SESSION_COOKIE_NAME,
  USER_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  USER_COOKIE_OPTIONS,
  validateCsrfOrigin,
} from '@/lib/auth/session-contract';
import { loginSchema } from '@/lib/validation/auth-schema';
import type { NestLoginResponse } from '@/types/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/login - Handles staff workspace sign-in via NestJS backend.
 * Stores JWT in HttpOnly SameSite cookie and sets safe user profile cookie.
 */
export async function POST(request: NextRequest) {
  // 1. Validate CSRF origin for state mutation
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { statusCode: 403, message: 'Invalid or missing request origin' },
      { status: 403 }
    );
  }

  // 2. Parse & validate request credentials
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, message: 'Invalid JSON request payload' },
      { status: 400 }
    );
  }

  const parseResult = loginSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((e) => e.message);
    return NextResponse.json(
      { statusCode: 400, message: errorMessages },
      { status: 400 }
    );
  }

  const { email, password } = parseResult.data;

  // 3. Forward request to NestJS backend /api/v1/auth/login
  const { data, error, status } = await backendFetch<NestLoginResponse>('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (error || !data) {
    let clientMessage = error?.message || 'Authentication failed';
    if (status === 401) {
      clientMessage = 'Invalid staff email or password credentials.';
    } else if (status === 503) {
      clientMessage = 'Staff database service is unavailable. Verify backend Prisma wiring.';
    }

    return NextResponse.json(
      { statusCode: status, message: clientMessage },
      { status }
    );
  }

  // 4. Set HttpOnly JWT session cookie & safe user profile cookie
  const maxAgeSeconds = data.expiresIn || 900;

  const response = NextResponse.json(
    {
      success: true,
      user: data.user,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );

  response.cookies.set(SESSION_COOKIE_NAME, data.accessToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: maxAgeSeconds,
  });

  response.cookies.set(USER_COOKIE_NAME, JSON.stringify(data.user), {
    ...USER_COOKIE_OPTIONS,
    maxAge: maxAgeSeconds,
  });

  return response;
}

