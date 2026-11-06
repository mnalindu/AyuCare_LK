'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Save,
  X,
  ShieldCheck,
  AlertCircle,
  Building2,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast';
import {
  createPatientSchema,
  CreatePatientFormData,
  getTodayColombo,
} from '@/lib/validation/patient-schema';
import type { Patient } from '@/types/patient';
import {
  createPatient,
  updatePatient,
  calculateAgeFromDob,
  formatPatientNumber,
} from '../services/patient-client';
import { UnsavedChangesDialog } from './unsaved-changes-dialog';

export interface PatientFormProps {
  mode: 'create' | 'edit';
  initialData?: Patient;
}

export function PatientForm({ mode, initialData }: PatientFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      address: initialData?.address || '',
    },
  });

  const watchedName = watch('fullName');
  const watchedDob = watch('dateOfBirth');
  const watchedPhone = watch('phone');
  const watchedEmail = watch('email');

  const liveAge = calculateAgeFromDob(watchedDob);
  const previewInitial = watchedName?.trim() ? watchedName.trim()[0].toUpperCase() : '?';

  async function onSubmit(data: CreatePatientFormData) {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (mode === 'create') {
        const created = await createPatient({
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
        });

        success(
          'Patient Registered',
          `Successfully registered ${created.fullName} (${formatPatientNumber(created.patientNumber)})`
        );
        router.push(`/patients/${created.id}`);
      } else if (mode === 'edit' && initialData) {
        const updated = await updatePatient(initialData.id, {
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
        });

        success(
          'Patient Updated',
          `Successfully updated record for ${updated.fullName}`
        );
        router.push(`/patients/${updated.id}`);
      }
    } catch (err: unknown) {
      const errorObj = err as { statusCode?: number; message?: string | string[]; details?: string | string[] };
      const status = errorObj.statusCode || 500;
      let message = 'An unexpected error occurred while saving the patient record.';

      if (status === 409) {
        message = 'A patient with matching full name, date of birth, and contact details already exists.';
      } else if (status === 403) {
        message = 'Access forbidden: Your staff role is not authorized to register or edit patients.';
      } else if (status === 401) {
        message = 'Your session has expired. Please sign in again.';
      } else if (status === 503) {
        message = 'The clinical database service is currently unavailable. Please check backend connectivity.';
      } else if (errorObj.message) {
        message = Array.isArray(errorObj.message) ? errorObj.message.join(', ') : errorObj.message;
      }

      setApiError(message);
      toastError(mode === 'create' ? 'Registration Failed' : 'Update Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancelClick() {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      router.back();
    }
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesDialog
        isOpen={showCancelDialog}
        onConfirm={() => {
          setShowCancelDialog(false);
          router.back();
        }}
        onCancel={() => setShowCancelDialog(false)}
      />

      {/* Global Form Error Banner */}
      {apiError && (
        <Alert
          variant="danger"
          title={mode === 'create' ? 'Registration Error' : 'Update Conflict'}
          onClose={() => setApiError(null)}
        >
          {apiError}
        </Alert>
      )}

      {/* Read-Only Notice in Edit Mode */}
      {mode === 'edit' && initialData && (
        <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold font-mono">
              #{initialData.patientNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-navy-950">
                  {formatPatientNumber(initialData.patientNumber)}
                </span>
                <Badge variant="teal" className="text-[10px]">
                  Server-Managed ID
                </Badge>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                UUID: <span className="font-mono">{initialData.id}</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-text-muted flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-muted/60" />
            <span>Server timestamps and identifiers cannot be altered.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Sections (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: Demographics / Identity */}
            <Card>
              <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="font-headline text-base font-semibold text-text-strong">
                      Legal Identity &amp; Demographics
                    </h2>
                    <p className="text-xs text-text-muted">
                      Primary verified patient identity fields
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-700/20">
                  Required Fields
                </span>
              </div>

              <CardContent className="space-y-5 pt-6">
                {/* Full Name */}
                <Input
                  label="Full Legal Name"
                  required
                  placeholder="e.g. Kavinda Priyankara Jayasuriya"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.fullName?.message}
                  helperText="Enter full name as per identity documents (1 to 200 characters)."
                  {...register('fullName')}
                />

                {/* Date of Birth with live age pill */}
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="dob-input"
                      className="block text-xs font-semibold tracking-wide text-text-strong uppercase"
                    >
                      Date of Birth
                    </label>
                    {watchedDob && liveAge !== 'Not provided' && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-700/20">
                        Calculated Age: {liveAge}
                      </span>
                    )}
                  </div>
                  <Input
                    id="dob-input"
                    type="date"
                    max={getTodayColombo()}
                    leftIcon={<Calendar className="h-4 w-4" />}
                    error={errors.dateOfBirth?.message}
                    helperText="Standard YYYY-MM-DD. Cannot be a future date in Asia/Colombo."
                    {...register('dateOfBirth')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Contact & Address */}
            <Card>
              <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="font-headline text-base font-semibold text-text-strong">
                      Contact Channels &amp; Residential Address
                    </h2>
                    <p className="text-xs text-text-muted">
                      Direct outreach, notification phone, and postal address
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-bg-canvas px-2.5 py-0.5 rounded-full border border-border-subtle">
                  Optional Details
                </span>
              </div>

              <CardContent className="space-y-5 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <Input
                    label="Primary Mobile Phone"
                    type="tel"
                    placeholder="e.g. +94771234567 or 0771234567"
                    leftIcon={<Phone className="h-4 w-4" />}
                    error={errors.phone?.message}
                    helperText="7 to 15 digits with optional leading +"
                    {...register('phone')}
                  />

                  {/* Email */}
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. patient@example.com"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={errors.email?.message}
                    helperText="For digital consultation summaries"
                    {...register('email')}
                  />
                </div>

                {/* Address Textarea */}
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="address-input"
                    className="block text-xs font-semibold tracking-wide text-text-strong uppercase"
                  >
                    Residential Address
                  </label>
                  <div className="relative">
                    <textarea
                      id="address-input"
                      rows={3}
                      placeholder="e.g. No. 18/4, Temple Road, Maharagama, Colombo District"
                      className="w-full rounded-lg border border-border-subtle bg-white p-3 text-sm text-text-strong placeholder:text-text-muted/60 transition-colors focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                      {...register('address')}
                    />
                  </div>
                  {errors.address && (
                    <p role="alert" className="text-xs text-danger font-medium mt-1">
                      {errors.address.message}
                    </p>
                  )}
                  <p className="text-xs text-text-muted">
                    Street, town, and district (maximum 1000 characters).
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-4 z-20 rounded-xl bg-white/95 backdrop-blur-md p-4 border border-border-subtle shadow-level2 flex items-center justify-between gap-4">
              <Button
                variant="secondary"
                size="md"
                onClick={handleCancelClick}
                leftIcon={<X className="h-4 w-4" />}
              >
                Cancel
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {mode === 'create' ? 'Create Patient Record' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Record Card Preview (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <div className="p-5 border-b border-border-subtle/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Live Record Preview
                </span>
                <Badge variant={mode === 'create' ? 'warning' : 'teal'}>
                  {mode === 'create' ? 'Draft Record' : 'Active Record'}
                </Badge>
              </div>

              <CardContent className="p-5 space-y-4">
                <div className="p-4 rounded-xl bg-bg-canvas flex items-center gap-3 border border-border-subtle">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg shadow-sm border border-teal-700/20">
                    {previewInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-text-strong truncate">
                      {watchedName?.trim() || 'Unspecified Patient'}
                    </p>
                    <p className="text-xs text-text-muted">
                      Age: {liveAge}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-border-subtle/60 pt-3">
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Clinic Node:</span>
                    <span className="font-medium text-text-strong">Colombo Central OP</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Assigned Queue:</span>
                    <span className="font-medium text-text-strong">General Outpatient Triage</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-muted">Identifier:</span>
                    <span className="font-mono font-bold text-teal-700">
                      {mode === 'edit' && initialData
                        ? formatPatientNumber(initialData.patientNumber)
                        : 'Assigned after registration'}
                    </span>
                  </div>
                  {watchedPhone && (
                    <div className="flex justify-between py-1 truncate">
                      <span className="text-text-muted">Phone:</span>
                      <span className="font-medium text-text-strong truncate">{watchedPhone}</span>
                    </div>
                  )}
                  {watchedEmail && (
                    <div className="flex justify-between py-1 truncate">
                      <span className="text-text-muted">Email:</span>
                      <span className="font-medium text-text-strong truncate">{watchedEmail}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sri Lanka Health Information Assurance Card */}
            <div className="rounded-xl bg-navy-950 text-white p-5 space-y-3 shadow-level1">
              <div className="flex items-center gap-2 text-teal-400">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  NHIS Data Standards
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registered patients are indexed in accordance with Sri Lanka Outpatient Clinic Master Data standards. Demographic records are synchronized to local registry nodes.
              </p>
              <div className="pt-2 border-t border-navy-800/80 flex items-center gap-2 text-[11px] text-teal-400">
                <Building2 className="h-3.5 w-3.5" />
                <span>Western Province OPD Terminal #04</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

