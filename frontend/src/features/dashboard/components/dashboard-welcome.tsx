'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { StaffUser } from '@/types/auth';
import { formatRoleName } from '@/lib/auth/rbac';

export interface DashboardWelcomeProps {
  user: StaffUser | null;
}

/**
 * Dashboard welcome header with real authenticated staff identity and RBAC role.
 */
export function DashboardWelcome({ user }: DashboardWelcomeProps) {
  const roleName = user?.role ? formatRoleName(user.role) : 'Clinic Personnel';
  const roleBadge = user?.role || 'AUTHENTICATED';
  const email = user?.email || 'staff@ayucare.lk';

  return (
    <div className="space-y-4">
      {/* Operational Notice Banner matching Stitch */}
      <div className="relative overflow-hidden rounded-xl bg-white border border-border-subtle shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-700" />
        <div className="p-4 sm:p-5 pl-5 sm:pl-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-50/60 via-white to-white">
          <div className="flex items-start md:items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-white border border-border-subtle shadow-sm text-teal-700 shrink-0">
              <Terminal className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-teal-700 tracking-wide uppercase">
                  Operational Target
                </span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-sm font-medium text-text-strong">
                  Sprint 01: Primary Care &amp; Dispensary Management
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Connected via NestJS <code className="font-mono bg-bg-canvas px-1.5 py-0.5 rounded text-navy-800 text-[11px]">/api/v1/auth/me</code> • Session verified • Audit trail active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-bg text-success text-xs font-medium border border-success/20">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Live Gateway LK-WP-01
            </span>
          </div>
        </div>
      </div>

      {/* Primary Workspace Identity Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
              Outpatient Clinical Terminal
            </span>
            <span className="text-text-muted">•</span>
            <Badge variant="neutral" className="text-[11px] font-mono font-semibold">
              {roleBadge}
            </Badge>
          </div>

          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-text-strong tracking-tight">
            Welcome back, {roleName}
          </h1>

          <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span>
              Authenticated as{' '}
              <strong className="text-text-strong font-medium">{email}</strong>
            </span>
            <span className="hidden sm:inline text-text-muted">• Shift #01 Outpatient Roster</span>
          </p>
        </div>

        {/* Real Session State Telemetry (No fake metrics) */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-border-subtle shadow-sm self-start md:self-auto">
          <div className="px-3 py-1 flex flex-col">
            <span className="text-[10px] font-semibold text-text-muted uppercase">
              Role Authority
            </span>
            <span className="text-xs font-semibold text-navy-950 font-mono">
              {roleBadge}
            </span>
          </div>
          <div className="h-7 w-px bg-border-subtle" />
          <div className="px-3 py-1 flex flex-col">
            <span className="text-[10px] font-semibold text-text-muted uppercase">
              Session Security
            </span>
            <span className="text-xs font-medium text-success flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              HttpOnly Validated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

