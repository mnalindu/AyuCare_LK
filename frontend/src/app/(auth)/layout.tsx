import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSessionToken } from '@/lib/auth/session-contract';

export const dynamic = 'force-dynamic';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerSessionToken();

  // If already authenticated with active session, redirect to staff dashboard
  if (token) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg-canvas flex flex-col justify-center items-center">
      {children}
    </div>
  );
}

