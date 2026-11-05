'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PatientPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  className?: string;
}

export function PatientPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PatientPaginationProps) {
  if (total === 0 || totalPages <= 1) {
    return null;
  }

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  // Calculate pages to show
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2',
        className
      )}
    >
      <div className="text-xs text-text-muted">
        Showing <strong className="text-text-strong">{startRecord}</strong> to{' '}
        <strong className="text-text-strong">{endRecord}</strong> of{' '}
        <strong className="text-text-strong">{total}</strong> records
      </div>

      <div className="flex items-center gap-1 self-center sm:self-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) => {
            if (typeof p === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs text-text-muted select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-all',
                  isCurrent
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'bg-white hover:bg-bg-canvas text-navy-800 border border-border-subtle'
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

