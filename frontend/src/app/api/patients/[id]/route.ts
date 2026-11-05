import { NextRequest, NextResponse } from 'next/server';
import { backendFetch } from '@/lib/api/http-client';
import {
  getServerSessionToken,
  getBackendAuthHeaders,
  validateCsrfOrigin,
} from '@/lib/auth/session-contract';
import { updatePatientSchema } from '@/lib/validation/patient-schema';
import type { Patient } from '@/types/patient';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = 'force-dynamic';

/**
 * GET /api/patients/:id - Retrieves a patient record by UUID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getServerSessionToken();
  if (!token) {
    return NextResponse.json(
      { statusCode: 401, message: 'Authentication required. No active session token.' },
      { status: 401, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  }

  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { statusCode: 400, message: 'Invalid patient UUID format' },
      { status: 400 }
    );
  }

  const authHeaders = await getBackendAuthHeaders();

  const { data, error, status } = await backendFetch<Patient>(`patients/${id}`, {
    method: 'GET',
    headers: authHeaders,
  });

  if (error || !data) {
    return NextResponse.json(
      error || { statusCode: status, message: 'Patient not found' },
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
 * PATCH /api/patients/:id - Updates permitted patient fields.
 * Requires: SUPER_ADMIN, CLINIC_ADMIN, RECEPTIONIST.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { statusCode: 403, message: 'Invalid or missing request origin' },
      { status: 403 }
    );
  }

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { statusCode: 400, message: 'Invalid patient UUID format' },
      { status: 400 }
    );
  }

  const token = await getServerSessionToken();
  if (!token) {
    return NextResponse.json(
      { statusCode: 401, message: 'Authentication required. No active session token.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { statusCode: 400, message: 'Invalid JSON request body' },
      { status: 400 }
    );
  }

  const parseResult = updatePatientSchema.safeParse(rawBody);
  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((e) => e.message);
    return NextResponse.json(
      { statusCode: 400, message: errorMessages },
      { status: 400 }
    );
  }

  const validatedData = parseResult.data;

  const authHeaders = await getBackendAuthHeaders();

  const { data, error, status } = await backendFetch<Patient>(`patients/${id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify(validatedData),
  });

  if (error || !data) {
    return NextResponse.json(
      error || { statusCode: status, message: 'Failed to update patient record' },
      { status }
    );
  }

  return NextResponse.json(data, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}

