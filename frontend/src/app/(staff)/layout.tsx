import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSessionToken, getServerSessionUser } from '@/lib/auth/session-contract';
import { StaffShell } from '@/components/layout/staff-shell';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerSessionToken();

  // Server-side route protection: redirect unauthenticated requests to login
  if (!token) {
    redirect('/login?reason=session_expired');
  }

  const user = await getServerSessionUser();

  return <StaffShell user={user}>{children}</StaffShell>;
}

