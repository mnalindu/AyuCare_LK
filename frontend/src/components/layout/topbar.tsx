'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, LogOut, Menu, UserCircle } from 'lucide-react';
import { StaffRole, StaffUser } from '@/types/auth';
import { formatRoleName } from '@/lib/auth/rbac';
import { Badge } from '@/components/ui/badge';

export interface TopbarProps {
  user?: StaffUser | null;
  onOpenMobileMenu?: () => void;
}

export function Topbar({ user, onOpenMobileMenu }: TopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Best effort logout
    } finally {
      router.push('/login');
      router.refresh();
    }
  }

  const roleTitle = user?.role
    ? formatRoleName(user.role)
    : 'Authenticated Staff';

  return (
    <header className="fixed top-0 left-0 lg:left-[248px] right-0 h-16 bg-white/95 backdrop-blur-md z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-border-subtle shadow-[0_1px_8px_rgba(11,23,41,0.04)]">
      {/* Left Area: Mobile Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation menu"
            className="lg:hidden p-2 rounded-lg text-text-muted hover:text-text-strong hover:bg-bg-canvas transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-text-muted">
          <span className="hidden sm:inline">AyuCare Staff</span>
          <ChevronRight className="hidden sm:inline h-3.5 w-3.5 text-text-muted/60" />
          <span className="font-medium text-text-strong truncate">
            Clinical Workspace
          </span>
        </div>

        <Badge variant="teal" className="hidden md:inline-flex text-[11px]">
          Sprint 01
        </Badge>
      </div>

      {/* Right Area: Session Identity & Sign Out */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {user?.role && (
          <div className="hidden md:flex items-center">
            <span className="px-2 py-0.5 rounded bg-bg-canvas text-navy-800 text-[11px] font-semibold tracking-wider uppercase border border-border-subtle">
              {user.role}
            </span>
          </div>
        )}

        <div className="hidden sm:block h-5 w-px bg-border-subtle" />

        {/* User Card */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-700/20 font-semibold text-xs">
            {user?.email ? user.email.slice(0, 2).toUpperCase() : <UserCircle className="h-5 w-5" />}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-text-strong leading-none">
              {roleTitle}
            </span>
            <span className="text-[11px] text-text-muted leading-tight mt-0.5 max-w-[140px] truncate">
              {user?.email || 'staff@ayucare.lk'}
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-border-subtle" />

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign Out"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-danger-bg text-text-strong hover:text-danger text-xs font-medium border border-border-subtle transition-colors shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

