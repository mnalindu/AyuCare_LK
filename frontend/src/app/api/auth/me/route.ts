import { NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/http-client';
import {
  getServerSessionToken,
  getBackendAuthHeaders,
} from '@/lib/auth/session-contract';
import type { StaffUser } from '@/types/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me - Returns the currently authenticated staff user profile.
 * Reads the HttpOnly session cookie server-side and proxies to NestJS backend.
 * Never exposes the raw JWT token to client JavaScript.
 */
export async function GET() {
  const token = await getServerSessionToken();

  if (!token) {
    return NextResponse.json(
      { statusCode: 401, message: 'No active session. Please sign in.' },
      {
        status: 401,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  const authHeaders = await getBackendAuthHeaders();

  const { data, error, status } = await backendFetch<StaffUser>('auth/me', {
    method: 'GET',
    headers: authHeaders,
  });

  if (error || !data) {
    const clientMessage =
      status === 401
        ? 'Session has expired. Please sign in again.'
        : error?.message || 'Unable to retrieve session profile.';

    return NextResponse.json(
      { statusCode: status, message: clientMessage },
      {
        status,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  return NextResponse.json(
    { data },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}

