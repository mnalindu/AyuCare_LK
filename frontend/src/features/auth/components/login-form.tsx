'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PasswordInput } from './password-input';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth-schema';

export interface LoginFormProps {
  expiredNotice?: boolean;
  onSwitchToSignUp?: () => void;
}

/**
 * Staff login form with client-side Zod validation and HttpOnly cookie BFF handling.
 * Does not expose or store JWT tokens in localStorage.
 */
export function LoginForm({ expiredNotice = false, onSwitchToSignUp }: LoginFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        let message = 'Authentication failed. Please verify your credentials.';
        if (result?.message) {
          message = Array.isArray(result.message)
            ? result.message.join(', ')
            : result.message;
        } else if (response.status === 401) {
          message = 'Invalid staff email or password credentials.';
        } else if (response.status === 503) {
          message =
            'Clinical database service is temporarily offline. Please ensure the backend is available.';
        }
        setApiError(message);
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      // Hard navigation to dashboard so all server components and shells pick up the new HttpOnly cookie
      window.location.href = '/dashboard';
    } catch {
      setApiError('Unable to connect to AyuCare authentication service. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Heading */}
      <div>
        <h2 className="font-headline text-2xl font-bold text-text-strong tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Sign in to your clinical operations workspace. All sessions are encrypted and audited.
        </p>
      </div>

      {expiredNotice && (
        <Alert variant="warning" title="Session Expired">
          Your active staff session has expired or was cleared. Please sign in again to access the workspace.
        </Alert>
      )}

      {apiError && (
        <Alert
          variant="danger"
          title="Sign In Failed"
          onClose={() => setApiError(null)}
        >
          {apiError}
        </Alert>
      )}

      {isSuccess && (
        <Alert variant="success" title="Authenticated Successfully">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span>Establishing secure session. Redirecting to staff workspace...</span>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <div>
          <Input
            id="staff-email"
            type="email"
            label="Clinic Staff Email"
            placeholder="staff.reception@ayucare.lk"
            autoComplete="username"
            leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
            helperText="SLMC-registered clinic email (e.g. doctor, receptionist, admin)"
            error={errors.email?.message}
            disabled={isSubmitting || isSuccess}
            required
            {...register('email')}
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="staff-password"
              className="block text-xs font-semibold tracking-wide text-text-strong uppercase"
            >
              Security Password <span className="text-danger">*</span>
            </label>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Lock className="h-3 w-3 text-text-muted" aria-hidden="true" />
              256-bit Encrypted
            </span>
          </div>

          <PasswordInput
            id="staff-password"
            placeholder="Enter workspace credentials"
            autoComplete="current-password"
            helperText="Minimum 1 character required by backend DTO"
            error={errors.password?.message}
            disabled={isSubmitting || isSuccess}
            required
            {...register('password')}
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isSubmitting || isSuccess}
            rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
          </Button>
        </div>
      </form>

      {/* Security Disclaimer */}
      <div className="pt-2 flex items-start gap-2 text-xs text-text-muted border-t border-border-subtle">
        <ShieldCheck className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed text-[11px]">
          <strong>Authorized Personnel Only:</strong> Access attempts are recorded in accordance with National Digital Health Guidelines and clinical data protection policies.
        </p>
      </div>

      {/* Switch to Sign Up toggle */}
      {onSwitchToSignUp && (
        <div className="pt-2 border-t border-border-subtle flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <span>Don&apos;t have staff access yet?</span>
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold text-teal-700 hover:text-teal-800 hover:underline focus:outline-none focus:underline"
          >
            Request Access
          </button>
        </div>
      )}
    </div>
  );
}
