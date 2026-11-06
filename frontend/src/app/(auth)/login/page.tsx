import React from 'react';
import type { Metadata } from 'next';
import { AuthSplitCard } from '@/features/auth/components/auth-split-card';

export const metadata: Metadata = {
  title: 'Staff Authentication | AyuCare LK',
  description: 'Primary Care & Outpatient Dispensary Management System — Clinical Staff Portal',
};

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const expired =
    resolvedSearchParams.expired === 'true' ||
    resolvedSearchParams.reason === 'session_expired';

  const initialMode =
    resolvedSearchParams.mode === 'signup' ? 'signup' : 'login';

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 bg-bg-canvas overflow-x-hidden">
      {/* Subtle Ambient Background Glows */}
      <div
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-teal-100/50 blur-3xl opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-slate-200/60 blur-3xl opacity-50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Split Authentication Card */}
      <div className="relative z-10 w-full max-w-5xl">
        <AuthSplitCard
          expiredNotice={expired}
          initialMode={initialMode}
        />
      </div>
    </div>
  );
}
