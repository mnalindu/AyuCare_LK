import { redirect } from 'next/navigation';
import { getServerSessionToken } from '@/lib/auth/session-contract';

export const dynamic = 'force-dynamic';

/**
 * Root page server redirect:
 * - If active staff session token exists in HttpOnly cookies, redirect to /dashboard.
 * - Otherwise, redirect to /login for staff workspace sign-in.
 */
export default async function RootPage() {
  const token = await getServerSessionToken();

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
