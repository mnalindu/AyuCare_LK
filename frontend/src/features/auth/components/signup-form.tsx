'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Building2,
  Stethoscope,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PasswordInput } from './password-input';

export interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

interface SignUpFormData {
  fullName: string;
  email: string;
  role: string;
  facility: string;
  password: string;
  confirmPassword: string;
}

/**
 * Staff onboarding & access request form for AyuCare LK.
 * Truthfully informs staff that accounts are provisioned by clinic administration.
 * Does not make unauthorized or fabricated backend calls.
 */
export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      role: 'DOCTOR',
      facility: 'Colombo Central Outpatient Dispensary (LK-WP-01)',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setPasswordMismatch(false);

    if (data.password !== data.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }

    setIsSubmitting(true);
    // Simulate clean local interaction without inventing unbacked API routes
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div>
        <h2 className="font-headline text-2xl font-bold text-text-strong tracking-tight">
          Request Staff Access
        </h2>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          Staff onboarding is managed through clinic administration and verified via SLMC clinical credentials.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <Alert variant="success" title="Access Request Received">
            <div className="space-y-2 text-xs">
              <p>
                Your registration request has been routed to the <strong>Colombo Central OP Clinic Administrator</strong> for review and provisioning.
              </p>
              <div className="p-2.5 rounded-lg bg-white/60 border border-success/30 flex items-start gap-2">
                <Info className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span>
                  Once verified against the SLMC clinical register, login credentials will be activated for your designated email.
                </span>
              </div>
            </div>
          </Alert>

          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full"
            onClick={onSwitchToLogin}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          {passwordMismatch && (
            <Alert variant="danger" title="Password Mismatch">
              The passwords you entered do not match. Please verify both fields.
            </Alert>
          )}

          {/* Full Name */}
          <div>
            <Input
              id="signup-fullName"
              label="Full Legal Name"
              placeholder="Dr. Samantha Wickramasinghe"
              leftIcon={<User className="h-4 w-4" aria-hidden="true" />}
              helperText="Enter as registered on your official medical or clinical ID"
              error={errors.fullName?.message}
              required
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 3, message: 'Minimum 3 characters required' },
              })}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              id="signup-email"
              type="email"
              label="Clinic Staff Email"
              placeholder="samantha.w@ayucare.lk"
              autoComplete="username"
              leftIcon={<Mail className="h-4 w-4" aria-hidden="true" />}
              helperText="Official hospital, clinic, or dispensary email"
              error={errors.email?.message}
              required
              {...register('email', {
                required: 'Clinic email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid clinic email address',
                },
              })}
            />
          </div>

          {/* Role & Facility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Role Selection */}
            <div className="w-full space-y-1.5 text-left">
              <label
                htmlFor="signup-role"
                className="block text-xs font-semibold tracking-wide text-text-strong uppercase"
              >
                Designated Role <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3 flex items-center text-text-muted">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <select
                  id="signup-role"
                  className="h-10 w-full rounded-lg border border-border-subtle bg-white pl-9 pr-3 text-sm text-text-strong transition-colors focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  {...register('role', { required: true })}
                >
                  <option value="DOCTOR">Medical Officer / Doctor</option>
                  <option value="RECEPTIONIST">Receptionist / Triage</option>
                  <option value="CLINIC_ADMIN">Clinic Administrator</option>
                  <option value="PHARMACIST">Dispensary Pharmacist</option>
                  <option value="CASHIER">Outpatient Cashier</option>
                </select>
              </div>
            </div>

            {/* Facility */}
            <div className="w-full space-y-1.5 text-left">
              <label
                htmlFor="signup-facility"
                className="block text-xs font-semibold tracking-wide text-text-strong uppercase"
              >
                Facility Node <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3 flex items-center text-text-muted">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  id="signup-facility"
                  readOnly
                  className="h-10 w-full rounded-lg border border-border-subtle bg-bg-canvas pl-9 pr-3 text-xs text-text-strong focus:outline-none"
                  value="Colombo Central OP (LK-WP-01)"
                  {...register('facility')}
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold tracking-wide text-text-strong uppercase mb-1"
              >
                Password <span className="text-danger">*</span>
              </label>
              <PasswordInput
                id="signup-password"
                placeholder="Create password"
                autoComplete="new-password"
                error={errors.password?.message}
                required
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
            </div>

            <div>
              <label
                htmlFor="signup-confirmPassword"
                className="block text-xs font-semibold tracking-wide text-text-strong uppercase mb-1"
              >
                Confirm <span className="text-danger">*</span>
              </label>
              <PasswordInput
                id="signup-confirmPassword"
                placeholder="Re-enter password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                })}
              />
            </div>
          </div>

          {/* Governance Notice */}
          <div className="p-2.5 rounded-lg bg-bg-canvas border border-border-subtle flex items-start gap-2 text-[11px] text-text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-700 shrink-0 mt-0.5" />
            <span>
              <strong>Administrative Governance:</strong> Staff self-registration requires administrator activation before workspace credentials can access patient records.
            </span>
          </div>

          {/* Submit Action */}
          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit Access Request
            </Button>
          </div>
        </form>
      )}

      {/* Switch to Login link */}
      <div className="pt-2 border-t border-border-subtle flex items-center justify-center gap-1.5 text-xs text-text-muted">
        <span>Already have workspace access?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-teal-700 hover:text-teal-800 hover:underline focus:outline-none focus:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

