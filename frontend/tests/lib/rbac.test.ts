import { describe, it, expect } from 'vitest';
import { canViewPatients, canManagePatients, formatRoleName } from '@/lib/auth/rbac';
import { StaffRole } from '@/types/auth';

describe('RBAC Helpers', () => {
  describe('canViewPatients', () => {
    it('allows SUPER_ADMIN, CLINIC_ADMIN, RECEPTIONIST, and DOCTOR', () => {
      expect(canViewPatients(StaffRole.SUPER_ADMIN)).toBe(true);
      expect(canViewPatients(StaffRole.CLINIC_ADMIN)).toBe(true);
      expect(canViewPatients(StaffRole.RECEPTIONIST)).toBe(true);
      expect(canViewPatients(StaffRole.DOCTOR)).toBe(true);
    });

    it('forbids PHARMACIST and CASHIER', () => {
      expect(canViewPatients(StaffRole.PHARMACIST)).toBe(false);
      expect(canViewPatients(StaffRole.CASHIER)).toBe(false);
    });

    it('returns false for null or undefined role', () => {
      expect(canViewPatients(null)).toBe(false);
      expect(canViewPatients(undefined)).toBe(false);
    });
  });

  describe('canManagePatients (Create / Edit)', () => {
    it('allows SUPER_ADMIN, CLINIC_ADMIN, and RECEPTIONIST', () => {
      expect(canManagePatients(StaffRole.SUPER_ADMIN)).toBe(true);
      expect(canManagePatients(StaffRole.CLINIC_ADMIN)).toBe(true);
      expect(canManagePatients(StaffRole.RECEPTIONIST)).toBe(true);
    });

    it('STRICTLY forbids DOCTOR from modifying patient records', () => {
      expect(canManagePatients(StaffRole.DOCTOR)).toBe(false);
    });

    it('forbids PHARMACIST and CASHIER from modifying patient records', () => {
      expect(canManagePatients(StaffRole.PHARMACIST)).toBe(false);
      expect(canManagePatients(StaffRole.CASHIER)).toBe(false);
    });
  });

  describe('formatRoleName', () => {
    it('formats roles into clean display strings', () => {
      expect(formatRoleName(StaffRole.SUPER_ADMIN)).toBe('Super Administrator');
      expect(formatRoleName(StaffRole.DOCTOR)).toBe('Medical Officer / Doctor');
      expect(formatRoleName(StaffRole.RECEPTIONIST)).toBe('Receptionist / Triage');
    });

    it('returns Unassigned for missing role', () => {
      expect(formatRoleName(null)).toBe('Unassigned');
    });
  });
});

