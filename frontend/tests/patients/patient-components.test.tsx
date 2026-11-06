import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientSearchBar } from '@/features/patients/components/patient-search-bar';
import { PatientPagination } from '@/features/patients/components/patient-pagination';
import { PatientListTable } from '@/features/patients/components/patient-list-table';
import { UnsavedChangesDialog } from '@/features/patients/components/unsaved-changes-dialog';
import { StaffRole } from '@/types/auth';
import type { Patient } from '@/types/patient';

const mockPatients: Patient[] = [
  {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    patientNumber: 41,
    fullName: 'Kavinda Jayasuriya',
    dateOfBirth: '1984-06-12',
    phone: '+94771234567',
    email: 'kavinda@example.test',
    address: 'Maharagama, Colombo',
    isActive: true,
    createdAt: '2026-01-14T08:42:00.000Z',
    updatedAt: '2026-01-14T08:42:00.000Z',
  },
  {
    id: '8d0e7789-8536-41ef-055c-f18fd2f01bf8',
    patientNumber: 42,
    fullName: 'Nimali Perera',
    dateOfBirth: '1992-10-05',
    phone: '+94719876543',
    email: 'nimali@example.test',
    address: 'Nugegoda, Colombo',
    isActive: true,
    createdAt: '2026-01-15T10:20:00.000Z',
    updatedAt: '2026-01-15T10:20:00.000Z',
  },
];

describe('Patient Feature Components', () => {
  describe('PatientSearchBar', () => {
    it('renders with placeholder and current value', () => {
      render(
        <PatientSearchBar
          value="Kavinda"
          onChange={vi.fn()}
          totalRecords={42}
        />
      );
      expect(screen.getByDisplayValue('Kavinda')).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
    });

    it('triggers debounced onChange when typing', async () => {
      const handleChange = vi.fn();
      render(<PatientSearchBar value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox', { name: /search patients/i });
      fireEvent.change(input, { target: { value: 'Nimali' } });

      await waitFor(
        () => {
          expect(handleChange).toHaveBeenCalledWith('Nimali');
        },
        { timeout: 600 }
      );
    });

    it('clears search input when clear button is clicked', () => {
      const handleChange = vi.fn();
      render(<PatientSearchBar value="Kavinda" onChange={handleChange} />);

      const clearBtn = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearBtn);
      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('PatientPagination', () => {
    it('disables previous button on first page and enables next', () => {
      const handlePage = vi.fn();
      render(
        <PatientPagination
          page={1}
          totalPages={5}
          total={100}
          limit={20}
          onPageChange={handlePage}
        />
      );

      const prevBtn = screen.getByRole('button', { name: /previous page/i });
      const nextBtn = screen.getByRole('button', { name: /next page/i });

      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeEnabled();

      fireEvent.click(nextBtn);
      expect(handlePage).toHaveBeenCalledWith(2);
    });

    it('renders nothing when total is 0 or totalPages is 1', () => {
      const { container } = render(
        <PatientPagination
          page={1}
          totalPages={1}
          total={10}
          limit={20}
          onPageChange={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('PatientListTable', () => {
    it('renders patient rows with formatted numbers', () => {
      render(
        <PatientListTable
          patients={mockPatients}
          userRole={StaffRole.CLINIC_ADMIN}
        />
      );

      expect(screen.getAllByText('Kavinda Jayasuriya')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Patient #41')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Nimali Perera')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Patient #42')[0]).toBeInTheDocument();
    });

    it('shows Edit button for RECEPTIONIST / CLINIC_ADMIN, but hides Edit for DOCTOR', () => {
      // 1. With CLINIC_ADMIN: Edit buttons must be visible
      const { rerender } = render(
        <PatientListTable
          patients={mockPatients}
          userRole={StaffRole.CLINIC_ADMIN}
        />
      );
      expect(screen.getAllByRole('button', { name: /edit patient/i }).length).toBeGreaterThan(0);

      // 2. With DOCTOR: Edit buttons must NOT be present
      rerender(
        <PatientListTable
          patients={mockPatients}
          userRole={StaffRole.DOCTOR}
        />
      );
      expect(screen.queryByRole('button', { name: /edit patient/i })).toBeNull();
      // View buttons should still be visible
      expect(screen.getAllByRole('button', { name: /view patient details/i }).length).toBeGreaterThan(0);
    });

    it('renders empty state when patient list is empty', () => {
      render(
        <PatientListTable
          patients={[]}
          userRole={StaffRole.RECEPTIONIST}
        />
      );
      expect(screen.getByText(/no patients found/i)).toBeInTheDocument();
    });
  });

  describe('UnsavedChangesDialog', () => {
    it('triggers onConfirm when Discard Changes is clicked', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <UnsavedChangesDialog
          isOpen={true}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /discard changes/i }));
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('triggers onCancel when Continue Editing is clicked', () => {
      const handleConfirm = vi.fn();
      const handleCancel = vi.fn();

      render(
        <UnsavedChangesDialog
          isOpen={true}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /continue editing/i }));
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });
});

