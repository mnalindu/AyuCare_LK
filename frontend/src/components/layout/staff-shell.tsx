'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileNav } from './mobile-nav';
import type { StaffUser } from '@/types/auth';

export interface StaffShellProps {
  user: StaffUser | null;
  children: React.ReactNode;
}

export function StaffShell({ user, children }: StaffShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-canvas flex flex-col">
      {/* Desktop Persistent Sidebar (hidden on < 1024px) */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Off-Canvas Navigation Drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Top Navigation Bar */}
      <Topbar
        user={user}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[248px] pt-16">
        <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

