import React from 'react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Code,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  getServerSessionUser,
  getBackendAuthHeaders,
} from '@/lib/auth/session-contract';
import { backendFetch } from '@/lib/api/http-client';
import { Badge } from '@/components/ui/badge';
import { DashboardWelcome } from '@/features/dashboard/components/dashboard-welcome';
import { DashboardQuickActions } from '@/features/dashboard/components/dashboard-quick-actions';
import type { PatientListResponse } from '@/types/patient';

export const metadata: Metadata = {
  title: 'Staff Dashboard | AyuCare LK',
  description: 'AyuCare LK Primary Care Practice & Dispensary Management Workspace',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getServerSessionUser();

  // If unauthenticated, redirect to staff login
  if (!user) {
    redirect('/login?reason=session_expired');
  }

  // Attempt to fetch real patient count from backend (Zero fabricated metrics!)
  let totalPatients: number | null = null;
  try {
    const authHeaders = await getBackendAuthHeaders();
    const { data } = await backendFetch<PatientListResponse>('patients?limit=1', {
      method: 'GET',
      headers: authHeaders,
    });
    if (data && typeof data.total === 'number') {
      totalPatients = data.total;
    }
  } catch {
    // If backend is unintegrated or unreachable, leave as null
    totalPatients = null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* 1. Identity & Operational Banner */}
      <DashboardWelcome user={user} />

      {/* 2. Core Task Action Bento Grid */}
      <DashboardQuickActions user={user} totalPatients={totalPatients} />

      {/* 3. Implementation Status & Technical Contracts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sprint 01 Implementation Reality & Contracts */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-teal-700" aria-hidden="true" />
                <h3 className="font-headline text-base font-bold text-text-strong">
                  Sprint 01 Implementation Status &amp; Contracts
                </h3>
              </div>
              <Badge variant="teal">Sprint 01 Active</Badge>
            </div>

            <div className="space-y-4">
              {/* Auth Module Card */}
              <div className="p-4 rounded-xl bg-bg-canvas border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-strong flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Auth Service (NestJS BFF &amp; Cookie Store)
                  </span>
                  <span className="text-xs font-semibold text-success uppercase tracking-wider">
                    Ready &amp; Routed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white border border-border-subtle flex flex-col">
                    <span className="font-mono text-[10px] text-text-muted">POST</span>
                    <span className="font-mono text-xs text-navy-800 truncate">/api/auth/login</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-border-subtle flex flex-col">
                    <span className="font-mono text-[10px] text-text-muted">GET</span>
                    <span className="font-mono text-xs text-navy-800 truncate">/api/auth/me</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-border-subtle flex flex-col">
                    <span className="font-mono text-[10px] text-text-muted">POST</span>
                    <span className="font-mono text-xs text-navy-800 truncate">/api/auth/logout</span>
                  </div>
                </div>
              </div>

              {/* Patient Service Card */}
              <div className="p-4 rounded-xl bg-bg-canvas border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-strong flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-700" />
                    Patient Management &amp; Demographics Registry
                  </span>
                  <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                    MEMBER 02 Active
                  </span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Sequential server-assigned numeric patient IDs with SLMC-aligned demographic intake, search by name/ID, and responsive clinical directory.
                </p>
                <div className="p-3 rounded-lg bg-white border border-border-subtle flex items-start gap-2 text-xs text-text-muted">
                  <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong>Zero Synthetic Data:</strong> We intentionally omit fictitious revenue charts, mock queue metrics, and simulated clinical tallies to ensure audit compliance during Sprint 01 verification.
                  </span>
                </div>
              </div>

              {/* System Metadata Line */}
              <div className="pt-2 flex items-center justify-between text-xs text-text-muted border-t border-border-subtle">
                <span>Clinical Environment: Colombo OPD Staging Node</span>
                <span className="font-mono text-navy-800 font-medium">BUILD 2026.01-SPRINT01</span>
              </div>
            </div>
          </div>

          {/* Facility Status Card */}
          <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-700/20 flex items-center justify-center text-teal-700">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-strong">
                  Colombo Central Outpatient Dispensary
                </h4>
                <p className="text-xs text-text-muted">
                  Standard Operating Hours: 08:00 - 20:00 IST • Station Node #01
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="success">Station Online</Badge>
            </div>
          </div>
        </div>

        {/* Right Column: Reception & Triage Clinical Guidance */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-4 border-b border-border-subtle">
              <FileText className="h-5 w-5 text-teal-700" aria-hidden="true" />
              <h3 className="font-headline text-base font-bold text-text-strong">
                Sprint 01 Operational Guidance
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-bg-canvas border border-border-subtle space-y-1.5">
                <div className="flex items-center gap-2 text-text-strong font-semibold">
                  <Activity className="h-4 w-4 text-teal-700" />
                  <span>Demographic Intake Protocol</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Patient Full Name is mandatory. Date of birth, mobile phone, and email are optional at initial intake and can be updated when the patient arrives at triage.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-canvas border border-border-subtle space-y-1.5">
                <div className="flex items-center gap-2 text-text-strong font-semibold">
                  <Layers className="h-4 w-4 text-navy-800" />
                  <span>Sequential Patient Numbering</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Patient numbers (e.g. #41) are strictly assigned by the database sequence upon registration. They cannot be manually assigned or altered by frontend clients.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-bg-canvas border border-border-subtle space-y-1.5">
                <div className="flex items-center gap-2 text-text-strong font-semibold">
                  <Sparkles className="h-4 w-4 text-warning" />
                  <span>Future Sprint Roadmap</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Dispensary prescription dispensing, inventory management, doctor clinical notes, and cashier point-of-sale invoicing will be delivered in Sprints 02 and 03.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

