import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { StaffUser } from '@/types/auth';

/**
 * Cookie configuration constants.
 * Session token is stored in a strict HttpOnly, SameSite=Lax cookie.
 */
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ayucare_session';
export const USER_COOKIE_NAME = 'ayucare_user_info';

/**
 * Options for setting the HttpOnly session cookie.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' || process.env.SESSION_COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 900, // 15 minutes matching backend JWT lifetime
};

/**
 * Options for the non-sensitive client readable profile cookie.
 */
export const USER_COOKIE_OPTIONS = {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production' || process.env.SESSION_COOKIE_SECURE === 'true',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 900,
};

/**
 * Retrieves the raw JWT bearer token from HttpOnly cookies in a server-only context.
 * Returns null if no active session cookie exists.
 */
export async function getServerSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token || null;
}

/**
 * Retrieves the safe staff user profile from cookies in a server-only context.
 */
export async function getServerSessionUser(): Promise<StaffUser | null> {
  const cookieStore = await cookies();
  const userJson = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as StaffUser;
  } catch {
    return null;
  }
}

/**
 * Builds standard Authorization headers to forward to NestJS backend services.
 */
export async function getBackendAuthHeaders(): Promise<Record<string, string>> {
  const token = await getServerSessionToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Validates request Origin/Referer headers for state-changing BFF requests (CSRF protection).
 */
export function validateCsrfOrigin(request: NextRequest): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    // If running in development without origin header, check referer
    const referer = request.headers.get('referer');
    if (referer && referer.includes(host || 'localhost')) return true;
    return process.env.NODE_ENV !== 'production';
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

