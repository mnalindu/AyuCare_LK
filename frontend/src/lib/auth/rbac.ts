import { StaffRole } from '@/types/auth';

/**
 * Checks whether a staff role has permission to view patient directory and records.
 */
export function canViewPatients(role?: StaffRole | null): boolean {
  if (!role) return false;
  return [
    StaffRole.SUPER_ADMIN,
    StaffRole.CLINIC_ADMIN,
    StaffRole.RECEPTIONIST,
    StaffRole.DOCTOR,
  ].includes(role);
}

/**
 * Checks whether a staff role has permission to create or edit patient records.
 * Note: DOCTORS are strictly read-only for patient demographics/records.
 */
export function canManagePatients(role?: StaffRole | null): boolean {
  if (!role) return false;
  return [
    StaffRole.SUPER_ADMIN,
    StaffRole.CLINIC_ADMIN,
    StaffRole.RECEPTIONIST,
  ].includes(role);
}

/**
 * Formats enum role values into clean human-readable titles.
 */
export function formatRoleName(role?: StaffRole | null): string {
  if (!role) return 'Unassigned';
  switch (role) {
    case StaffRole.SUPER_ADMIN:
      return 'Super Administrator';
    case StaffRole.CLINIC_ADMIN:
      return 'Clinic Administrator';
    case StaffRole.DOCTOR:
      return 'Medical Officer / Doctor';
    case StaffRole.RECEPTIONIST:
      return 'Receptionist / Triage';
    case StaffRole.PHARMACIST:
      return 'Dispensary Pharmacist';
    case StaffRole.CASHIER:
      return 'Outpatient Cashier';
    default:
      return role;
  }
}

