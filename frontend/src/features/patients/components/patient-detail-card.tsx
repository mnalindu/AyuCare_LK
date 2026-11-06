'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Copy,
  Check,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Activity,
  Building2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { canManagePatients } from '@/lib/auth/rbac';
import { StaffRole } from '@/types/auth';
import type { Patient } from '@/types/patient';
import {
  calculateAgeFromDob,
  formatPatientNumber,
} from '../services/patient-client';

export interface PatientDetailCardProps {
  patient: Patient;
  userRole?: StaffRole | null;
}

export function PatientDetailCard({ patient, userRole }: PatientDetailCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canEdit = canManagePatients(userRole);
  const formattedNumber = formatPatientNumber(patient.patientNumber);
  const age = calculateAgeFromDob(patient.dateOfBirth);

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function handleCopy(text: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Patients
            </Button>
          </Link>
          <div className="h-5 w-px bg-border-subtle hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-navy-950">
              {formattedNumber}
            </span>
            <Badge variant="teal" className="text-[10px]">
              Active Patient
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {canEdit ? (
            <Link href={`/patients/${patient.id}/edit`}>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit2 className="h-4 w-4" />}
              >
                Edit Patient
              </Button>
            </Link>
          ) : (
            <span className="text-xs text-text-muted bg-bg-canvas px-3 py-1.5 rounded-lg border border-border-subtle font-medium">
              Read-Only Scope (Doctor / Viewer)
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column (4 cols) & Right Column (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Identity Card & Audit Metadata */}
        <div className="lg:col-span-4 space-y-6">
          {/* Visual Profile Card */}
          <Card className="text-center relative overflow-hidden">
            <div className="w-full h-16 bg-gradient-to-r from-teal-50 via-teal-100 to-teal-50 absolute top-0 left-0" />
            <CardContent className="pt-8 pb-6 flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-level1 border-4 border-white">
                  {getInitials(patient.fullName)}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-5 h-5 bg-success text-white rounded-full flex items-center justify-center shadow text-[10px]"
                  title="Active Record"
                >
                  ✓
                </span>
              </div>

              <h2 className="font-headline text-lg font-bold text-text-strong">
                {patient.fullName}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Outpatient Registry • Western Province
              </p>

              {/* Master ID Box with Copy */}
              <div className="mt-4 w-full bg-bg-canvas rounded-lg p-3 flex items-center justify-between border border-border-subtle">
                <div className="text-left">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider block">
                    Patient Number
                  </span>
                  <span className="font-mono text-xs font-bold text-teal-700">
                    {formattedNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(formattedNumber)}
                  aria-label="Copy patient ID"
                  className="p-1.5 rounded-md hover:bg-white text-text-muted hover:text-text-strong transition-colors"
                >
                  {copiedId === formattedNumber ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-4 border-t border-border-subtle/60 text-xs">
                <div className="p-2.5 bg-bg-canvas rounded-lg text-center">
                  <span className="text-text-muted block text-[11px]">Age</span>
                  <span className="font-semibold text-text-strong mt-0.5 block">
                    {age}
                  </span>
                </div>
                <div className="p-2.5 bg-bg-canvas rounded-lg text-center">
                  <span className="text-text-muted block text-[11px]">Status</span>
                  <span className="font-semibold text-success mt-0.5 block">
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Audit & Metadata Card */}
          <Card>
            <div className="p-5 border-b border-border-subtle/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-700" />
                <h3 className="font-headline text-sm font-semibold text-text-strong">
                  Record Timestamps &amp; System Keys
                </h3>
              </div>
              <span className="text-[11px] font-mono text-text-muted bg-bg-canvas px-2 py-0.5 rounded border border-border-subtle">
                Database Record
              </span>
            </div>

            <CardContent className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-bg-canvas space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block">
                  Record Created (createdAt)
                </span>
                <span className="font-medium text-text-strong block">
                  {formatDate(patient.createdAt)}
                </span>
                <span className="text-text-muted flex items-center gap-1 mt-0.5">
                  <Clock className="h-3.5 w-3.5 text-text-muted/60" />
                  System Timestamp
                </span>
              </div>

              <div className="p-3 rounded-lg bg-bg-canvas space-y-1">
                <span className="text-[10px] uppercase font-semibold text-text-muted tracking-wider block">
                  Last Updated (updatedAt)
                </span>
                <span className="font-medium text-text-strong block">
                  {formatDate(patient.updatedAt)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-700/20 text-teal-900 space-y-1">
                <div className="flex items-center gap-1 font-semibold text-teal-800">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Immutable Server UUID</span>
                </div>
                <p className="text-[11px] leading-relaxed text-teal-800/80">
                  Patient UUID and numeric ID are generated and managed by the PostgreSQL database.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Demographics & Contact Channels */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Identity & Demographics */}
          <Card>
            <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="h-5 w-5 text-teal-700" />
                <h3 className="font-headline text-base font-semibold text-text-strong">
                  Identity &amp; Demographics
                </h3>
              </div>
              <span className="text-xs text-text-muted">Primary Verified Data</span>
            </div>

            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-bg-canvas space-y-1 sm:col-span-2">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Full Legal Name
                </span>
                <span className="font-semibold text-base text-text-strong block">
                  {patient.fullName}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-bg-canvas space-y-1">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Date of Birth
                </span>
                <span className="font-semibold text-sm text-text-strong block">
                  {patient.dateOfBirth || 'Not provided'}
                </span>
                <span className="text-xs text-text-muted">
                  Calculated age: {age}
                </span>
              </div>

              <div className="p-4 rounded-lg bg-bg-canvas space-y-1">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  System UUID
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-text-strong truncate max-w-[200px]">
                    {patient.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(patient.id)}
                    aria-label="Copy UUID"
                    className="text-text-muted hover:text-teal-700 transition-colors p-1"
                  >
                    {copiedId === patient.id ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Contact & Residence */}
          <Card>
            <div className="p-6 border-b border-border-subtle/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Phone className="h-5 w-5 text-teal-700" />
                <h3 className="font-headline text-base font-semibold text-text-strong">
                  Contact Channels &amp; Residence
                </h3>
              </div>
              <span className="text-xs text-text-muted">Outreach &amp; Postal</span>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="p-4 rounded-lg bg-bg-canvas space-y-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                    Primary Phone Number
                  </span>
                  {patient.phone ? (
                    <a
                      href={`tel:${patient.phone}`}
                      className="font-semibold text-sm text-teal-700 hover:underline flex items-center gap-1.5 mt-1"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{patient.phone}</span>
                    </a>
                  ) : (
                    <span className="text-sm text-text-muted italic mt-1 block">
                      Not provided
                    </span>
                  )}
                </div>

                {/* Email */}
                <div className="p-4 rounded-lg bg-bg-canvas space-y-1">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                    Email Address
                  </span>
                  {patient.email ? (
                    <a
                      href={`mailto:${patient.email}`}
                      className="font-semibold text-sm text-text-strong hover:text-teal-700 hover:underline flex items-center gap-1.5 mt-1 truncate"
                    >
                      <Mail className="h-4 w-4 text-text-muted" />
                      <span className="truncate">{patient.email}</span>
                    </a>
                  ) : (
                    <span className="text-sm text-text-muted italic mt-1 block">
                      Not provided
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-lg bg-bg-canvas space-y-1">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Residential Address
                </span>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                  <span className="text-sm text-text-strong leading-relaxed">
                    {patient.address || 'No residential address recorded.'}
                  </span>
                </div>
              </div>

              {/* Clinic Terminal Node Info */}
              <div className="p-3.5 rounded-lg bg-white border border-border-subtle flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-teal-700" />
                  <span>Assigned Clinic Node: <strong>Colombo Central OP (LK-WP-01)</strong></span>
                </div>
                <Badge variant="teal" className="text-[10px]">
                  Sprint 01 Pilot
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

