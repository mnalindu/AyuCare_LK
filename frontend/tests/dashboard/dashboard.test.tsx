import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardWelcome } from '@/features/dashboard/components/dashboard-welcome';
import { DashboardQuickActions } from '@/features/dashboard/components/dashboard-quick-actions';
import { StaffRole } from '@/types/auth';

describe('Dashboard Components', () => {
  describe('DashboardWelcome', () => {
    it('renders authenticated user role, name, and email correctly', () => {
      const user = {
        id: 'user-001',
        email: 'priyantha.doctor@ayucare.lk',
        role: StaffRole.DOCTOR,
      };

      render(<DashboardWelcome user={user} />);

      expect(screen.getByText(/Medical Officer \/ Doctor/i)).toBeInTheDocument();
      expect(screen.getByText(/priyantha.doctor@ayucare.lk/i)).toBeInTheDocument();
      expect(screen.getAllByText('DOCTOR').length).toBeGreaterThan(0);
      expect(screen.getByText(/HttpOnly Validated/i)).toBeInTheDocument();
    });

    it('renders fallback title when user is null', () => {
      render(<DashboardWelcome user={null} />);

      expect(screen.getByText(/Welcome back, Clinic Personnel/i)).toBeInTheDocument();
      expect(screen.getByText(/staff@ayucare.lk/i)).toBeInTheDocument();
    });
  });

  describe('DashboardQuickActions', () => {
    it('allows RECEPTIONIST to access both Register Patient and Browse Patients actions', () => {
      const user = {
        id: 'usr-rec',
        email: 'reception@ayucare.lk',
        role: StaffRole.RECEPTIONIST,
      };

      render(<DashboardQuickActions user={user} totalPatients={42} />);

      expect(screen.getByRole('heading', { name: /Register New Patient/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Register Patient/i })).toBeInTheDocument();

      expect(screen.getByRole('heading', { name: /Find & Manage Patients/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Browse Patients/i })).toBeInTheDocument();

      expect(screen.getByText('42 Total Records')).toBeInTheDocument();
    });

    it('allows SUPER_ADMIN and CLINIC_ADMIN to register patients', () => {
      const user = {
        id: 'usr-admin',
        email: 'admin@ayucare.lk',
        role: StaffRole.CLINIC_ADMIN,
      };

      render(<DashboardQuickActions user={user} totalPatients={15} />);

      expect(screen.getByRole('heading', { name: /Register New Patient/i })).toBeInTheDocument();
    });

    it('enforces read-only restriction for DOCTOR role on patient registration', () => {
      const user = {
        id: 'usr-doc',
        email: 'doctor@ayucare.lk',
        role: StaffRole.DOCTOR,
      };

      render(<DashboardQuickActions user={user} totalPatients={20} />);

      // Doctors cannot register patients:
      expect(screen.queryByRole('button', { name: /Register Patient/i })).not.toBeInTheDocument();
      expect(screen.getByText(/Read-Only Scope/i)).toBeInTheDocument();

      // But doctors can browse patients:
      expect(screen.getByRole('heading', { name: /Find & Manage Patients/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Browse Patients/i })).toBeInTheDocument();
    });

    it('shows upcoming sprint scope notice for PHARMACIST without patient creation CTAs', () => {
      const user = {
        id: 'usr-pharm',
        email: 'pharmacist@ayucare.lk',
        role: StaffRole.PHARMACIST,
      };

      render(<DashboardQuickActions user={user} totalPatients={null} />);

      expect(screen.queryByRole('button', { name: /Register Patient/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Browse Patients/i })).not.toBeInTheDocument();
      expect(screen.getByText(/Role Workstation/i)).toBeInTheDocument();
      expect(screen.getByText(/Dispensary prescription fulfillment/i)).toBeInTheDocument();
    });

    it('renders Record Index badge when totalPatients is null without fabricating numbers', () => {
      const user = {
        id: 'usr-admin',
        email: 'admin@ayucare.lk',
        role: StaffRole.SUPER_ADMIN,
      };

      render(<DashboardQuickActions user={user} totalPatients={null} />);

      expect(screen.getByText('Record Index')).toBeInTheDocument();
      expect(screen.getByText(/Live PostgreSQL registry lookup/i)).toBeInTheDocument();
    });
  });
});

