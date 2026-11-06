'use client';

import React from 'react';
import {
  ShieldCheck,
  Activity,
  HeartPulse,
  Users2,
  Building2,
  Lock,
  Sparkles,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface AuthVisualPanelProps {
  mode: 'login' | 'signup';
}

/**
 * Premium healthcare visual panel for AyuCare LK split-screen authentication.
 * Dynamically changes artwork, badge motifs, and messaging between Login and Sign Up.
 */
export function AuthVisualPanel({ mode }: AuthVisualPanelProps) {
  const isLogin = mode === 'login';

  return (
    <div className="relative w-full h-full min-h-[220px] sm:min-h-[280px] md:min-h-[640px] flex flex-col justify-between p-6 sm:p-8 md:p-12 overflow-hidden text-white select-none bg-gradient-to-br from-navy-950 via-[#0E2038] to-navy-950">
      {/* Background Decorative Ambient Glows */}
      <div
        className={`absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-40 transition-all duration-700 pointer-events-none ${
          isLogin ? 'bg-teal-700' : 'bg-cyan-600'
        }`}
        aria-hidden="true"
      />
      <div
        className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
          isLogin ? 'bg-navy-800' : 'bg-teal-800'
        }`}
        aria-hidden="true"
      />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Top Header Identity */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-700/80 backdrop-blur-md border border-teal-500/30 flex items-center justify-center shadow-lg">
            <Activity className="h-5 w-5 text-teal-200" aria-hidden="true" />
          </div>
          <div>
            <span className="font-headline text-base sm:text-lg font-bold tracking-tight text-white block">
              AyuCare LK
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-teal-300 tracking-wide uppercase block">
              Clinical Platform
            </span>
          </div>
        </div>

        <Badge
          variant="teal"
          className="bg-teal-900/60 border border-teal-400/30 text-teal-200 text-[10px] tracking-wider uppercase font-mono px-2.5 py-1"
        >
          {isLogin ? 'Station Active' : 'Staff Onboarding'}
        </Badge>
      </div>

      {/* Middle Interactive Artwork Section (Full illustration on desktop, compact on mobile) */}
      <div className="relative z-10 my-auto py-4 sm:py-6 md:py-8 transition-all duration-500">
        {isLogin ? (
          /* LOGIN ARTWORK: Secure Clinical Operations Motif */
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Central Graphic Composition */}
            <div className="relative mx-auto w-full max-w-xs flex items-center justify-center py-2 sm:py-4 md:py-6">
              {/* Outer decorative ring */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full border border-teal-500/20 flex items-center justify-center relative">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border border-teal-500/40 border-dashed flex items-center justify-center animate-spin-slow">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-2xl bg-teal-700/30 backdrop-blur-md border border-teal-400/40 flex items-center justify-center shadow-2xl">
                    <Lock className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-teal-300" aria-hidden="true" />
                  </div>
                </div>

                {/* Floating pill badge 1: EKG / Vitals */}
                <div className="hidden sm:flex absolute -top-2 -right-4 bg-navy-950/90 border border-teal-500/40 rounded-full px-3 py-1 items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <HeartPulse className="h-3.5 w-3.5 text-teal-400 animate-pulse" />
                  <span className="text-[11px] font-mono text-teal-200">OPD Node 01</span>
                </div>

                {/* Floating pill badge 2: Security */}
                <div className="hidden sm:flex absolute -bottom-2 -left-4 bg-navy-950/90 border border-emerald-500/40 rounded-full px-3 py-1 items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono text-emerald-200">SLMC RBAC</span>
                </div>
              </div>
            </div>

            {/* Narrative text */}
            <div className="space-y-1 sm:space-y-2 text-center md:text-left">
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-white tracking-tight">
                Secure Clinical Operations
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto md:mx-0">
                Single unified terminal for outpatient triage, sequential demographic registry, and clinical dispensary records.
              </p>
            </div>

            {/* Micro feature pills (Hidden on small mobile) */}
            <div className="hidden sm:grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
                <span>HttpOnly Sessions</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-teal-400 shrink-0" />
                <span>Audit Trail Active</span>
              </div>
            </div>
          </div>
        ) : (
          /* SIGN UP ARTWORK: Welcoming Healthcare Team Onboarding */
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Central Graphic Composition */}
            <div className="relative mx-auto w-full max-w-xs flex items-center justify-center py-2 sm:py-4 md:py-6">
              {/* Outer decorative ring */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-full border border-cyan-500/20 flex items-center justify-center relative">
                <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full border border-cyan-500/40 border-dashed flex items-center justify-center animate-spin-slow">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-2xl bg-cyan-700/30 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center shadow-2xl">
                    <Users2 className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-cyan-300" aria-hidden="true" />
                  </div>
                </div>

                {/* Floating pill badge 1: Onboarding */}
                <div className="hidden sm:flex absolute -top-2 -left-4 bg-navy-950/90 border border-cyan-500/40 rounded-full px-3 py-1 items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono text-cyan-200">Staff Intake</span>
                </div>

                {/* Floating pill badge 2: Facility */}
                <div className="hidden sm:flex absolute -bottom-2 -right-4 bg-navy-950/90 border border-teal-500/40 rounded-full px-3 py-1 items-center gap-1.5 shadow-lg backdrop-blur-md">
                  <Building2 className="h-3.5 w-3.5 text-teal-400" />
                  <span className="text-[11px] font-mono text-teal-200">Colombo Node</span>
                </div>
              </div>
            </div>

            {/* Narrative text */}
            <div className="space-y-1 sm:space-y-2 text-center md:text-left">
              <h3 className="font-headline text-xl sm:text-2xl font-bold text-white tracking-tight">
                Join the Clinical Network
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto md:mx-0">
                Request verified workspace access to coordinate patient registration, triage queues, and dispensary care across Western Province.
              </p>
            </div>

            {/* Micro feature pills (Hidden on small mobile) */}
            <div className="hidden sm:grid grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Admin Provisioned</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>6 Clinical Roles</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Telemetry */}
      <div className="relative z-10 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-teal-400" />
          <span>Colombo Central OP</span>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] text-slate-400">Sri Lanka Health Network</span>
      </div>
    </div>
  );
}
