'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  Eye,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { canManagePatients } from '@/lib/auth/rbac';
import { StaffRole } from '@/types/auth';
import type { Patient } from '@/types/patient';
import {
  calculateAgeFromDob,
  formatPatientNumber,
} from '../services/patient-client';

export interface PatientListTableProps {
  patients: Patient[];
  isLoading?: boolean;
  userRole?: StaffRole | null;
  onRefresh?: () => void;
}

export function PatientListTable({
  patients,
  isLoading = false,
  userRole,
}: PatientListTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canEdit = canManagePatients(userRole);

  function handleCopyUuid(uuid: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(uuid);
      setCopiedId(uuid);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-level1">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2 border-b border-border-subtle/40 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9" rounded="full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-28 hidden md:block" />
                <Skeleton className="h-4 w-32 hidden sm:block" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (patients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No patients found"
        description="No records match your query or the patient registry is currently empty."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet Tabular View (>= 768px) */}
      <div className="hidden md:block">
        <Table aria-label="Outpatient Patient Registry">
          <TableHeader>
            <TableRow>
              <TableHead>Identifiers (System / UUID)</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Date of Birth &amp; Age</TableHead>
              <TableHead>Contact Channels</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const formattedNumber = formatPatientNumber(patient.patientNumber);
              const initials = getInitials(patient.fullName);
              const age = calculateAgeFromDob(patient.dateOfBirth);
              const isCopied = copiedId === patient.id;

              return (
                <TableRow key={patient.id} className="group">
                  {/* Identifiers */}
                  <TableCell className="whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-navy-950 bg-bg-canvas px-2 py-0.5 rounded border border-border-subtle">
                          {formattedNumber}
                        </span>
                        <Badge variant="teal" className="text-[10px] px-1.5">
                          WP-COL
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleCopyUuid(patient.id, e)}
                        title="Click to copy full UUID"
                        aria-label={`Copy UUID for ${patient.fullName}`}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-teal-700 transition-colors text-left"
                      >
                        <span className="truncate max-w-[110px]">{patient.id}</span>
                        {isCopied ? (
                          <Check className="h-3 w-3 text-success shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 shrink-0" />
                        )}
                      </button>
                    </div>
                  </TableCell>

                  {/* Full Name & Avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-semibold text-xs shrink-0 border border-teal-700/20">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/patients/${patient.id}`}
                          className="font-medium text-text-strong group-hover:text-teal-700 transition-colors block truncate hover:underline"
                        >
                          {patient.fullName}
                        </Link>
                        <span className="text-xs text-text-muted">
                          Patient #{patient.patientNumber}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* DOB & Age */}
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm font-medium text-text-strong">
                      {patient.dateOfBirth || '—'}
                    </div>
                    <div className="text-xs text-text-muted">{age}</div>
                  </TableCell>

                  {/* Contact Channels */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs">
                      {patient.phone ? (
                        <a
                          href={`tel:${patient.phone}`}
                          className="flex items-center gap-1.5 text-text-strong hover:text-teal-700 transition-colors"
                        >
                          <Phone className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                          <span>{patient.phone}</span>
                        </a>
                      ) : (
                        <span className="text-text-muted flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-text-muted/40 shrink-0" />
                          <span>No phone</span>
                        </span>
                      )}
                      {patient.email ? (
                        <a
                          href={`mailto:${patient.email}`}
                          className="flex items-center gap-1.5 text-text-muted hover:text-teal-700 transition-colors truncate max-w-[160px]"
                        >
                          <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                          <span className="truncate">{patient.email}</span>
                        </a>
                      ) : null}
                    </div>
                  </TableCell>

                  {/* Address */}
                  <TableCell className="max-w-[180px]">
                    <div className="text-xs text-text-muted truncate" title={patient.address || undefined}>
                      {patient.address || '—'}
                    </div>
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="whitespace-nowrap text-xs text-text-muted">
                    {formatDate(patient.createdAt)}
                  </TableCell>

                  {/* Actions (RBAC) */}
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <Link href={`/patients/${patient.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`View patient details for ${patient.fullName}`}
                          leftIcon={<Eye className="h-3.5 w-3.5" />}
                        >
                          View
                        </Button>
                      </Link>
                      {canEdit && (
                        <Link href={`/patients/${patient.id}/edit`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            aria-label={`Edit patient ${patient.fullName}`}
                            leftIcon={<Edit2 className="h-3.5 w-3.5" />}
                          >
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Stacked Card View (< 768px) */}
      <div className="md:hidden space-y-3">
        {patients.map((patient) => {
          const formattedNumber = formatPatientNumber(patient.patientNumber);
          const initials = getInitials(patient.fullName);
          const age = calculateAgeFromDob(patient.dateOfBirth);
          const isCopied = copiedId === patient.id;

          return (
            <div
              key={patient.id}
              className="bg-white rounded-xl border border-border-subtle p-4 shadow-level1 space-y-3"
            >
              {/* Header row: Number and Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-semibold text-xs border border-teal-700/20 shrink-0">
                    {initials}
                  </div>
                  <div>
                    <Link
                      href={`/patients/${patient.id}`}
                      className="font-semibold text-sm text-text-strong block hover:text-teal-700 transition-colors"
                    >
                      {patient.fullName}
                    </Link>
                    <span className="font-mono text-xs text-teal-700 font-bold">
                      {formattedNumber}
                    </span>
                  </div>
                </div>

                <Badge variant="teal" className="text-[10px]">
                  WP-COL
                </Badge>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border-subtle/50 text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span>{patient.dateOfBirth ? `${patient.dateOfBirth} (${age})` : 'DOB pending'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
                  <span className="truncate">{patient.phone || 'No phone'}</span>
                </div>
                {patient.address && (
                  <div className="col-span-2 flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
              </div>

              {/* UUID & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyUuid(patient.id, e)}
                  className="flex items-center gap-1 text-[11px] font-mono text-text-muted hover:text-teal-700 transition-colors"
                >
                  <span className="truncate max-w-[120px]">{patient.id}</span>
                  {isCopied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <Link href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                      View
                    </Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/patients/${patient.id}/edit`}>
                      <Button variant="secondary" size="sm" leftIcon={<Edit2 className="h-3.5 w-3.5" />}>
                        Edit
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

