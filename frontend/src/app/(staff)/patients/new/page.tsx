'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { PatientForm } from '@/features/patients/components/patient-form';
import { canManagePatients } from '@/lib/auth/rbac';
import { StaffRole } from '@/types/auth';

export default function RegisterNewPatientPage() {
  const [userRole, setUserRole] = useState<StaffRole | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const match = document.cookie.match(/ayucare_user_info=([^;]+)/);
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        if (parsed?.role) setUserRole(parsed.role as StaffRole);
      }
    } catch {
      // Default null
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const isForbidden = isLoaded && userRole !== null && !canManagePatients(userRole);

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/patients" className="hover:text-teal-700 transition-colors">
              Patients
            </Link>
            <span>/</span>
            <span className="font-semibold text-text-strong">Register New</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-navy-950 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-teal-700" />
            <span>Register New Patient</span>
          </h1>
          <p className="text-sm text-text-muted">
            Provision a new outpatient master record. Demographic data maps to NestJS Patient DTO.
          </p>
        </div>

        <Link href="/patients" className="self-start sm:self-center">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Directory
          </Button>
        </Link>
      </div>

      {/* Role Restriction Check (e.g. Doctor is Read-Only) */}
      {isForbidden ? (
        <Alert
          variant="warning"
          title="HTTP 403: Staff Role Restricted"
          badge={userRole || 'DOCTOR'}
          action={
            <Link href="/patients">
              <Button variant="secondary" size="sm">
                Return to Directory
              </Button>
            </Link>
          }
        >
          Your current active role ({userRole}) does not have permission to register new patient records.
          Patient registration is restricted to Super Admin, Clinic Admin, and Receptionist roles.
        </Alert>
      ) : (
        <PatientForm mode="create" />
      )}
    </div>
  );
}

