'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  RefreshCw,
  Users,
  Building2,
  Database,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { PatientSearchBar } from '@/features/patients/components/patient-search-bar';
import { PatientListTable } from '@/features/patients/components/patient-list-table';
import { PatientPagination } from '@/features/patients/components/patient-pagination';
import { getPatients } from '@/features/patients/services/patient-client';
import { canManagePatients } from '@/lib/auth/rbac';
import { StaffRole } from '@/types/auth';
import type { Patient, PatientListResponse } from '@/types/patient';

export default function PatientsDirectoryPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<StaffRole | null>(null);

  // Read client-side user role from cookie if present
  useEffect(() => {
    try {
      const match = document.cookie.match(/ayucare_user_info=([^;]+)/);
      if (match) {
        const parsed = JSON.parse(decodeURIComponent(match[1]));
        if (parsed?.role) setUserRole(parsed.role as StaffRole);
      }
    } catch {
      // Default to null if cookie unparseable
    }
  }, []);

  const fetchPatientsData = useCallback(
    async (currentPage: number, currentSearch: string, isSearchTrigger = false) => {
      if (isSearchTrigger) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      setApiError(null);

      try {
        const response: PatientListResponse = await getPatients({
          page: currentPage,
          limit,
          search: currentSearch,
        });

        setPatients(response.items || []);
        setPage(response.page || 1);
        setTotal(response.total || 0);
        setTotalPages(response.totalPages || 0);
      } catch (err: unknown) {
        const errorObj = err as { statusCode?: number; message?: string | string[] };
        let message = 'Unable to load patient directory from clinical API.';

        if (errorObj.statusCode === 503) {
          message = 'HTTP 503: Clinical backend service is offline. Ensure NestJS backend is running at http://localhost:3001/api/v1.';
        } else if (errorObj.statusCode === 403) {
          message = 'HTTP 403: Staff role lacks permission to browse patient records.';
        } else if (errorObj.statusCode === 401) {
          message = 'HTTP 401: Your session has expired. Please sign in again.';
        } else if (errorObj.message) {
          message = Array.isArray(errorObj.message) ? errorObj.message.join(', ') : errorObj.message;
        }

        setApiError(message);
        setPatients([]);
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchPatientsData(page, search);
  }, [fetchPatientsData, page, search]);

  function handleSearchChange(newSearch: string) {
    setSearch(newSearch);
    setPage(1); // Reset to first page on new query
  }

  function handlePageChange(newPage: number) {
    setPage(newPage);
  }

  const canRegister = canManagePatients(userRole);

  return (
    <div className="space-y-6">
      {/* Primary Header & Stats Banner */}
      <div className="rounded-xl border border-border-subtle bg-white p-6 shadow-level1 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-warning-bg text-warning font-mono text-[11px] font-semibold uppercase tracking-wider border border-warning/20">
                Outpatient Clinical Desk
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs text-text-muted">Western Province • District 01</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-navy-950">
              Patient Management
            </h1>
            <p className="text-sm text-text-muted">
              Search, view, and register clinic patients conforming to Sri Lanka Outpatient Clinic Master Data specifications.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            {canRegister && (
              <Link href="/patients/new">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<UserPlus className="h-4 w-4" />}
                >
                  Register Patient
                </Button>
              </Link>
            )}
            <Button
              variant="secondary"
              size="md"
              onClick={() => fetchPatientsData(page, search)}
              isLoading={isLoading}
              aria-label="Refresh patient directory"
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Live Metrics Mini-Bento Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-border-subtle/60 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-canvas border border-border-subtle">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-teal-700 shadow-sm shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="font-headline text-base font-bold text-text-strong">
                {total}
              </div>
              <div className="text-[11px] text-text-muted">Total Registered</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-canvas border border-border-subtle">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-teal-700 shadow-sm shrink-0">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="font-headline text-base font-bold text-text-strong">
                Active Registry
              </div>
              <div className="text-[11px] text-text-muted">Prisma DTO Schema</div>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3 rounded-lg bg-bg-canvas border border-border-subtle">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-navy-800 shadow-sm shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-headline text-base font-bold text-text-strong">
                LK-WP-01
              </div>
              <div className="text-[11px] text-text-muted">Colombo Central OP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Outage / Error Banner */}
      {apiError && (
        <Alert
          variant="danger"
          title="Clinical Service Alert"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fetchPatientsData(page, search)}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Retry Connection
            </Button>
          }
        >
          {apiError}
        </Alert>
      )}

      {/* Search Bar */}
      <PatientSearchBar
        value={search}
        onChange={handleSearchChange}
        isSearching={isSearching}
        totalRecords={total}
      />

      {/* Patient Table & Cards */}
      <PatientListTable
        patients={patients}
        isLoading={isLoading}
        userRole={userRole}
        onRefresh={() => fetchPatientsData(page, search)}
      />

      {/* Pagination Controls */}
      <PatientPagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

