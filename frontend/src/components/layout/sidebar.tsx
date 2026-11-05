'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const defaultNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: Users,
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'w-[248px] bg-navy-950 text-white flex flex-col justify-between select-none h-screen fixed left-0 top-0 z-40',
        className
      )}
    >
      <div className="flex flex-col">
        {/* Brand Masthead */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-navy-800/60">
          <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold tracking-tight text-white leading-tight">
              AyuCare LK
            </span>
            <span className="text-[10px] text-teal-400 font-medium tracking-wide uppercase">
              Clinical Platform
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="px-3 py-4">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          <nav className="flex flex-col gap-1 mt-2">
            {defaultNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-navy-800 text-teal-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Terminal Node Information Card */}
      <div className="p-3 bg-navy-950 border-t border-navy-800/60">
        <div className="p-3 rounded-lg bg-navy-800/90 flex flex-col gap-1 border border-slate-700/40">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Clinic Node
          </span>
          <span className="text-xs font-semibold text-white truncate">
            Colombo Central OP
          </span>
          <span className="text-[11px] text-slate-400 truncate">
            Terminal #04 • LK-WP-01
          </span>
        </div>
      </div>
    </aside>
  );
}

