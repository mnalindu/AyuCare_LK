'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PatientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching?: boolean;
  totalRecords?: number;
  className?: string;
}

export function PatientSearchBar({
  value,
  onChange,
  isSearching = false,
  totalRecords,
  className,
}: PatientSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextVal = e.target.value;
    setLocalValue(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(nextVal);
    }, 350);
  }

  function handleClear() {
    setLocalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange('');
  }

  return (
    <div className={cn('bg-white rounded-xl p-4 sm:p-5 shadow-level1 space-y-3', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search input field */}
        <div className="relative flex-1 max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            placeholder="Search by Full Name, Patient Number (e.g. 41), or UUID..."
            aria-label="Search patients by name, number, or UUID"
            className="w-full h-11 pl-10 pr-24 rounded-lg bg-bg-canvas text-sm font-medium text-text-strong placeholder:text-text-muted border border-border-subtle focus:border-teal-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700/20 transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            {isSearching && (
              <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded animate-pulse font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Searching...</span>
              </span>
            )}
            {localValue && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search input"
                className="text-text-muted hover:text-text-strong p-1 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Index capability badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-semibold text-[11px] uppercase tracking-wider border border-teal-700/20">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-700" />
            Search Scope: Name • Number • UUID
          </span>
        </div>
      </div>

      {/* Tally strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border-subtle/60 text-xs text-text-muted">
        <div>
          {totalRecords !== undefined ? (
            <span>
              Showing <strong className="text-text-strong">{totalRecords}</strong> {totalRecords === 1 ? 'patient' : 'patients'} in registry
            </span>
          ) : (
            <span>Querying patient records...</span>
          )}
        </div>
        <div className="text-[11px]">
          Sorted by <span className="font-semibold text-text-strong">Newest First (createdAt desc)</span>
        </div>
      </div>
    </div>
  );
}

