'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, RefreshCw, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { PatientForm } from '@/features/patients/components/patient-form';
import { getPatientById, formatPatientNumber } from '@/features/patients/services/patient-client';
import { canManagePatients } from '@/lib/auth/rbac';
import { StaffRole } from '@/types/auth';
import type { Patient } from '@/types/patient';

export default function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<StaffRole | null>(null);

  useEffect(() => {
    try {
      const match = document.cookie.match(/ayucare_user_info=([^;]+)/);
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        if (parsed?.role) setUserRole(parsed.role as StaffRole);
      }
    } catch {
      // Default null
    }
  }, []);

  const loadPatient = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorStatus(null);

    try {
      const data = await getPatientById(id);
      setPatient(data);
    } catch (err: unknown) {
      const errObj = err as { statusCode?: number; message?: string | string[] };
      const status = errObj.statusCode || 500;
      setErrorStatus(status);

      let msg = 'Failed to load patient record.';
      if (status === 404) {
        msg = 'The requested patient record could not be found in the clinical registry.';
      } else if (status === 503) {
        msg = 'HTTP 503: Clinical database service is temporarily unavailable. Check NestJS backend.';
      } else if (errObj.message) {
        msg = Array.isArray(errObj.message) ? errObj.message.join(', ') : errObj.message;
      }
      setErrorMessage(msg);
      setPatient(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const isForbidden = userRole !== null && !canManagePatients(userRole);

  // Role Restriction Check (e.g. Doctor is Read-Only)
  if (isForbidden) {
    return (
      <div className="space-y-6">
        <Alert
          variant="warning"
          title="HTTP 403: Role Mutation Restricted"
          badge={userRole || 'DOCTOR'}
          action={
            <Link href={`/patients/${id}`}>
              <Button variant="secondary" size="sm">
                View Patient Record
              </Button>
            </Link>
          }
        >
          Your current staff role ({userRole}) is restricted to read-only access.
          Modifying patient records requires Super Admin, Clinic Admin, or Receptionist permissions.
        </Alert>
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="rounded-xl border border-border-subtle bg-white p-6 space-y-4">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  // 404 Not Found State
  if (errorStatus === 404 || (!patient && !isLoading && !errorMessage)) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={UserX}
          title="Patient Record Not Found"
          description={`Cannot edit patient. No record found matching identifier: ${id}.`}
          action={
            <Link href="/patients">
              <Button variant="primary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Return to Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  // Error State
  if (errorMessage) {
    return (
      <div className="space-y-6">
        <Alert
          variant="danger"
          title="Error Loading Patient for Editing"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={loadPatient}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Retry
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/patients" className="hover:text-teal-700 transition-colors">
              Patients
            </Link>
            <span>/</span>
            <Link href={`/patients/${patient.id}`} className="hover:text-teal-700 transition-colors">
              {formatPatientNumber(patient.patientNumber)}
            </Link>
            <span>/</span>
            <span className="font-semibold text-text-strong">Edit</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 flex items-center gap-2">
            <Edit3 className="h-6 w-6 text-teal-700" />
            <span>Edit Patient Demographics</span>
          </h1>
          <p className="text-sm text-text-muted">
            Update demographic and contact details for {patient.fullName} ({formatPatientNumber(patient.patientNumber)}).
          </p>
        </div>

        <Link href={`/patients/${patient.id}`} className="self-start sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Details
          </Button>
        </Link>
      </div>

      {/* Edit Form */}
      <PatientForm mode="edit" initialData={patient} />
    </div>
  );
}

