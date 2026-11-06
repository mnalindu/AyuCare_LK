import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/http-client';
import {
  SESSION_COOKIE_NAME,
  USER_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  USER_COOKIE_OPTIONS,
  getBackendAuthHeaders,
  validateCsrfOrigin,
} from '@/lib/auth/session-contract';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/logout - Clears the client session by deleting HttpOnly cookies.
 *
 * Best-effort call to NestJS POST /api/v1/auth/logout is made but its result
 * is intentionally ignored. The NestJS backend is stateless (no token blocklist),
 * so the JWT remains cryptographically valid until its natural expiry (15 min).
 * The client session is cleared immediately by zeroing the cookie maxAge.
 */
export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { statusCode: 403, message: 'Invalid or missing request origin' },
      { status: 403 }
    );
  }

  // Best-effort — notify the NestJS backend (stateless, errors are acceptable)
  try {
    const authHeaders = await getBackendAuthHeaders();
    await backendFetch('auth/logout', {
      method: 'POST',
      headers: authHeaders,
    });
  } catch {
    // Intentionally ignored — backend logout is advisory only
  }

  // Clear both session cookies by setting maxAge to 0
  const response = NextResponse.json(
    {
      success: true,
      message:
        'Client session cleared. JWT remains cryptographically valid until server-side expiry (15 min). No server-side token revocation is performed.',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    }
  );

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });

  response.cookies.set(USER_COOKIE_NAME, '', {
    ...USER_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}

