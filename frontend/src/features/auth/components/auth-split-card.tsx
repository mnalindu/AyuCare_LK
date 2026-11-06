'use client';

import React, { useState } from 'react';
import { LoginForm } from './login-form';
import { SignUpForm } from './signup-form';
import { AuthVisualPanel } from './auth-visual-panel';
import { Shield, Sparkles, LogIn, UserPlus } from 'lucide-react';

export interface AuthSplitCardProps {
  expiredNotice?: boolean;
  initialMode?: 'login' | 'signup';
}

/**
 * Split-screen interactive authentication container for AyuCare LK.
 * Features a side-swapping layout with smooth animations:
 * - LOGIN: Left = Login Form, Right = Illustration Panel
 * - SIGN UP: Left = Illustration Panel, Right = Sign Up Form
 */
export function AuthSplitCard({
  expiredNotice = false,
  initialMode = 'login',
}: AuthSplitCardProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const isLogin = mode === 'login';

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Mobile Mode Switcher Tabs (Visible on mobile/tablet screens < md) */}
      <div className="md:hidden mb-4 flex items-center justify-center">
        <div className="p-1 rounded-2xl bg-white border border-border-subtle shadow-sm flex items-center gap-1 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              isLogin
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-text-muted hover:text-text-strong'
            }`}
            aria-pressed={isLogin}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              !isLogin
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-text-muted hover:text-text-strong'
            }`}
            aria-pressed={!isLogin}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Request Access</span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container */}
      <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-border-subtle/80 min-h-[640px] flex flex-col md:flex-row">
        {/* DESKTOP SLIDING VISUAL PANEL (Overlay that slides between left & right) */}
        <div
          className={`hidden md:block absolute top-0 bottom-0 w-1/2 z-20 transition-transform duration-700 ease-in-out motion-reduce:transition-none ${
            isLogin ? 'translate-x-full' : 'translate-x-0'
          }`}
          aria-hidden="true"
        >
          <AuthVisualPanel mode={mode} />
        </div>

        {/* MOBILE VISUAL HEADER (Rendered only on mobile screens < md) */}
        <div className="md:hidden w-full">
          <AuthVisualPanel mode={mode} />
        </div>

        {/* FORMS GRID (Two equal 50% halves on desktop) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 relative z-10">
          {/* LEFT HALF (Hosts Login Form on Desktop) */}
          <div
            className={`flex flex-col justify-center p-6 sm:p-10 md:p-12 transition-opacity duration-500 ${
              isLogin
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none hidden md:flex'
            }`}
            aria-hidden={!isLogin}
          >
            {isLogin && (
              <LoginForm
                expiredNotice={expiredNotice}
                onSwitchToSignUp={() => setMode('signup')}
              />
            )}
          </div>

          {/* RIGHT HALF (Hosts Sign Up Form on Desktop) */}
          <div
            className={`flex flex-col justify-center p-6 sm:p-10 md:p-12 transition-opacity duration-500 ${
              !isLogin
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none hidden md:flex'
            }`}
            aria-hidden={isLogin}
          >
            {!isLogin && (
              <SignUpForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>

      {/* Footer Branding & Clinical Assurance */}
      <div className="mt-6 text-center text-xs text-text-muted flex items-center justify-center gap-2">
        <Shield className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
        <span>AyuCare LK · Western Province Health Informatics · Primary Care Practice Pilot</span>
      </div>
    </div>
  );
}

