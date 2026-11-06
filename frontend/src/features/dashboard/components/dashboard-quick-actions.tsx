'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Users,
  ArrowRight,
  Search,
  Lock,
  Clock,
  ShieldAlert,
  Database,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StaffUser } from '@/types/auth';
import { canManagePatients, canViewPatients } from '@/lib/auth/rbac';

export interface DashboardQuickActionsProps {
  user: StaffUser | null;
  totalPatients: number | null;
}

/**
 * Role-aware task action cards for the staff workspace dashboard.
 * Enforces AyuCare LK RBAC permissions.
 */
export function DashboardQuickActions({
  user,
  totalPatients,
}: DashboardQuickActionsProps) {
  const role = user?.role;
  const canManage = canManagePatients(role);
  const canView = canViewPatients(role);

  return (
    <div className="space-y-6">
      {/* 2-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Card 1: Register New Patient */}
        {canManage ? (
          <div className="group relative rounded-2xl bg-white border border-border-subtle p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div
              className="absolute -right-12 -top-12 w-40 h-40 bg-teal-50 rounded-full blur-2xl group-hover:bg-teal-100/60 transition-colors pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
                  <UserPlus className="h-6 w-6" aria-hidden="true" />
                </div>
                <Badge variant="teal">Intake Action</Badge>
              </div>

              <h2 className="font-headline text-xl font-bold text-text-strong tracking-tight mb-2">
                Register New Patient
              </h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Enroll a new outpatient with full demographic details, emergency contacts, and contact information. Automatically generates a sequential clinic patient number.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Building2 className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <span>Primary Care Registration Desk</span>
              </div>
              <Link href="/patients/new">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Register Patient
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-sm flex flex-col justify-between text-left opacity-90">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-bg-canvas text-text-muted flex items-center justify-center border border-border-subtle">
                  <Lock className="h-6 w-6 text-text-muted" aria-hidden="true" />
                </div>
                <Badge variant="neutral">Read-Only Scope</Badge>
              </div>

              <h2 className="font-headline text-xl font-bold text-text-strong tracking-tight mb-2">
                Patient Registration
              </h2>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                Patient intake and record creation are restricted to Receptionists and Clinic Administrators. Medical Officers and Pharmacy staff operate under read-only or specialized workflows.
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center gap-2 text-xs text-text-muted">
              <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
              <span>Restricted by Sprint 01 Clinical Governance policy.</span>
            </div>
          </div>
        )}

        {/* Action Card 2: Find & Manage Patients */}
        {canView ? (
          <div className="group relative rounded-2xl bg-white border border-border-subtle p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
            <div
              className="absolute -right-12 -top-12 w-40 h-40 bg-slate-100 rounded-full blur-2xl group-hover:bg-slate-200/60 transition-colors pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-sm">
                  <Users className="h-6 w-6" aria-hidden="true" />
                </div>
                <Badge variant="neutral">
                  {totalPatients !== null
                    ? `${totalPatients} Total Records`
                    : 'Record Index'}
                </Badge>
              </div>

              <h2 className="font-headline text-xl font-bold text-text-strong tracking-tight mb-2">
                Find &amp; Manage Patients
              </h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Search registered outpatients by full name, server-assigned patient number, or UUID. View comprehensive profiles, edit contact information, and audit record timestamps.
              </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Database className="h-4 w-4 text-navy-800" aria-hidden="true" />
                <span>
                  {totalPatients !== null
                    ? `${totalPatients} indexed outpatient files`
                    : 'Live PostgreSQL registry lookup'}
                </span>
              </div>
              <Link href="/patients">
                <Button
                  variant="secondary"
                  size="md"
                  rightIcon={<Search className="h-4 w-4" aria-hidden="true" />}
                >
                  Browse Patients
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-border-subtle p-6 shadow-sm flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-bg-canvas text-text-muted flex items-center justify-center border border-border-subtle">
                  <Clock className="h-6 w-6 text-text-muted" aria-hidden="true" />
                </div>
                <Badge variant="neutral">Upcoming Sprint</Badge>
              </div>

              <h2 className="font-headline text-xl font-bold text-text-strong tracking-tight mb-2">
                Role Workstation
              </h2>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                Dispensary prescription fulfillment and cashier invoicing modules are slated for Sprint 02. Your staff identity is active and authenticated in the gateway.
              </p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center gap-2 text-xs text-text-muted">
              <span>Sprint 01 active module: Demographics &amp; Patient Registry.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

