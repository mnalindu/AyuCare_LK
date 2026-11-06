import { clientFetch } from '@/lib/api/http-client';
import type {
  CreatePatientInput,
  Patient,
  PatientListResponse,
  PatientQueryParams,
  UpdatePatientInput,
} from '@/types/patient';

/**
 * Formats a raw numeric patient number as the true backend numeric identifier.
 * Before registration or if unassigned, returns "Assigned after registration".
 */
export function formatPatientNumber(patientNumber?: number | null): string {
  if (patientNumber === undefined || patientNumber === null || patientNumber <= 0) {
    return 'Assigned after registration';
  }
  return `Patient #${patientNumber}`;
}

/**
 * Calculates a person's current age based on YYYY-MM-DD date of birth string.
 */
export function calculateAgeFromDob(dobString?: string | null): string {
  if (!dobString) return 'Not provided';
  try {
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'Not provided';

    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }

    if (years < 1) {
      const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + m;
      return `${Math.max(0, months)} mos`;
    }

    return `${years} yrs`;
  } catch {
    return 'Not provided';
  }
}

/**
 * Client service to query the paginated patient directory.
 */
export async function getPatients(
  params: PatientQueryParams = {}
): Promise<PatientListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search && params.search.trim() !== '') {
    searchParams.set('search', params.search.trim());
  }

  const query = searchParams.toString();
  const endpoint = query ? `/api/patients?${query}` : '/api/patients';
  return clientFetch<PatientListResponse>(endpoint, { method: 'GET' });
}

/**
 * Client service to retrieve a single patient by UUID.
 */
export async function getPatientById(id: string): Promise<Patient> {
  return clientFetch<Patient>(`/api/patients/${id}`, { method: 'GET' });
}

/**
 * Client service to create a new patient record.
 */
export async function createPatient(
  payload: CreatePatientInput
): Promise<Patient> {
  return clientFetch<Patient>('/api/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Client service to update an existing patient record.
 */
export async function updatePatient(
  id: string,
  payload: UpdatePatientInput
): Promise<Patient> {
  return clientFetch<Patient>(`/api/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
