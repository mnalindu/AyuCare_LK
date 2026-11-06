'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { PatientDetailCard } from '@/features/patients/components/patient-detail-card';
import { getPatientById } from '@/features/patients/services/patient-client';
import { StaffRole } from '@/types/auth';
import type { Patient } from '@/types/patient';

export default function PatientDetailsPage({
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

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border border-border-subtle bg-white p-6 space-y-4">
              <Skeleton className="h-20 w-20 rounded-full mx-auto" />
              <Skeleton className="h-5 w-40 mx-auto" />
              <Skeleton className="h-4 w-28 mx-auto" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-xl border border-border-subtle bg-white p-6 space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>
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
          description={`No record found matching identifier: ${id}. The patient may have been unregistered or the UUID is invalid.`}
          action={
            <Link href="/patients">
              <Button variant="primary" size="md" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Return to Patient Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  // General Error / 503 State
  if (errorMessage) {
    return (
      <div className="space-y-6">
        <Alert
          variant="danger"
          title="Unable to Access Patient Record"
          action={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={loadPatient}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Retry
              </Button>
              <Link href="/patients">
                <Button variant="ghost" size="sm">
                  Back
                </Button>
              </Link>
            </div>
          }
        >
          {errorMessage}
        </Alert>
      </div>
    );
  }

  if (!patient) return null;

  return <PatientDetailCard patient={patient} userRole={userRole} />;
}

