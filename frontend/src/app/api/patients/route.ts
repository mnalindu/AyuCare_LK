import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/http-client';
import {
  getServerSessionToken,
  getBackendAuthHeaders,
  validateCsrfOrigin,
} from '@/lib/auth/session-contract';
import { createPatientSchema } from '@/lib/validation/patient-schema';
import type { Patient, PatientListResponse } from '@/types/patient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/patients - Lists and searches patients.
 * Query: page, limit, search
 */
export async function GET(request: NextRequest) {
  const token = await getServerSessionToken();
  if (!token) {
    return NextResponse.json(
      { statusCode: 401, message: 'Authentication required. No active session token.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';
  const search = searchParams.get('search');

  const query = new URLSearchParams({ page, limit });
  if (search && search.trim() !== '') {
    query.set('search', search.trim());
  }

  const authHeaders = await getBackendAuthHeaders();

  const { data, error, status } = await backendFetch<PatientListResponse>(
    `patients?${query.toString()}`,
    {
      method: 'GET',
      headers: authHeaders,
    }
  );

  if (error || !data) {
    return NextResponse.json(
      error || { statusCode: status, message: 'Failed to fetch patients list' },
      {
        status,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  return NextResponse.json(data, {
    status: 200,
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}

/**
 * POST /api/patients - Registers a new patient.
 * Requires: SUPER_ADMIN, CLINIC_ADMIN, RECEPTIONIST.
 */
export async function POST(request: NextRequest) {
  // 1. CSRF Protection for state mutations
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { statusCode: 403, message: 'Invalid or missing request origin' },
      { status: 403 }
    );
  }

  // 2. Authenticate session token
  const token = await getServerSessionToken();
  if (!token) {
    return NextResponse.json(
      { statusCode: 401, message: 'Authentication required. No active session token.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 3. Parse and validate payload
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, message: 'Invalid JSON request body' },
      { status: 400 }
    );
  }

  const parseResult = createPatientSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((e) => e.message);
    return NextResponse.json(
      { statusCode: 400, message: errorMessages },
      { status: 400 }
    );
  }

  const validatedData = parseResult.data;

  // 3. Forward to NestJS backend with bearer token
  const authHeaders = await getBackendAuthHeaders();

  const { data, error, status } = await backendFetch<Patient>('patients', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(validatedData),
  });

  if (error || !data) {
    return NextResponse.json(
      error || { statusCode: status, message: 'Failed to create patient record' },
      { status }
    );
  }

  return NextResponse.json(data, {
    status: 201,
    headers: { 'Cache-Control': 'no-store' },
  });
}

