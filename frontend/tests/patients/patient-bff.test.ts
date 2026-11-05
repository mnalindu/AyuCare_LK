import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getPatientsHandler, POST as createPatientHandler } from '@/app/api/patients/route';
import { GET as getPatientByIdHandler, PATCH as updatePatientHandler } from '@/app/api/patients/[id]/route';
import { backendFetch } from '@/lib/api/http-client';
import * as sessionContract from '@/lib/auth/session-contract';

vi.mock('@/lib/api/http-client', () => ({
  backendFetch: vi.fn(),
}));

describe('Patient BFF Route Handlers (Security & RBAC Enforcement)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    it('rejects unauthenticated requests with 401 Unauthorized', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/patients?page=1&limit=20');
      const response = await getPatientsHandler(request);

      expect(response.status).toBe(401);
      const json = await response.json();
      expect(json.message).toContain('Authentication required');
    });

    it('forwards search parameters and Bearer token when authenticated', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce('valid.jwt.token');
      vi.spyOn(sessionContract, 'getBackendAuthHeaders').mockResolvedValueOnce({
        Authorization: 'Bearer valid.jwt.token',
      });

      const mockResponse = {
        items: [
          {
            id: 'b1234567-89ab-cdef-0123-456789abcdef',
            patientNumber: 101,
            fullName: 'Anula Wijesinghe',
            dateOfBirth: '1978-04-12',
            phone: '+94712345678',
            email: 'anula.w@example.com',
            address: 'Colombo 05',
            isActive: true,
            createdAt: '2026-03-01T10:00:00.000Z',
            updatedAt: '2026-03-01T10:00:00.000Z',
          },
        ],
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(backendFetch).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/patients?page=1&limit=20&search=Anula');
      const response = await getPatientsHandler(request);

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.items).toHaveLength(1);
      expect(json.items[0].fullName).toBe('Anula Wijesinghe');

      // Verify backendFetch was called with sanitized query and auth headers
      expect(backendFetch).toHaveBeenCalledWith(
        'patients?page=1&limit=20&search=Anula',
        expect.objectContaining({
          method: 'GET',
          headers: { Authorization: 'Bearer valid.jwt.token' },
        })
      );
    });
  });

  describe('POST /api/patients', () => {
    it('enforces CSRF origin validation and rejects requests without matching origin', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          origin: 'http://malicious-site.com',
          host: 'localhost:3000',
        },
        body: JSON.stringify({ fullName: 'Malicious Attempt' }),
      });

      const response = await createPatientHandler(request);
      expect(response.status).toBe(403);

      const json = await response.json();
      expect(json.message).toContain('Invalid or missing request origin');
    });

    it('rejects unauthenticated creation requests with 401 Unauthorized', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({ fullName: 'Valid Name' }),
      });

      const response = await createPatientHandler(request);
      expect(response.status).toBe(401);
    });

    it('rejects schema-violating payloads with 400 Bad Request', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce('valid.jwt.token');

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          fullName: '', // empty name
          phone: 'invalid-phone-digits',
        }),
      });

      const response = await createPatientHandler(request);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(Array.isArray(json.message)).toBe(true);
    });
  });

  describe('GET & PATCH /api/patients/:id', () => {
    const validUuid = '12345678-1234-1234-1234-123456789abc';
    const invalidId = 'not-a-valid-uuid';

    it('GET rejects invalid UUID format with 400 Bad Request', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce('valid.jwt.token');

      const request = new NextRequest(`http://localhost:3000/api/patients/${invalidId}`);
      const response = await getPatientByIdHandler(request, {
        params: Promise.resolve({ id: invalidId }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.message).toContain('Invalid patient UUID format');
    });

    it('PATCH enforces valid UUID format and valid update fields', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce('valid.jwt.token');

      const request = new NextRequest(`http://localhost:3000/api/patients/${validUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          email: 'not-an-email', // invalid email
        }),
      });

      const response = await updatePatientHandler(request, {
        params: Promise.resolve({ id: validUuid }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(Array.isArray(json.message)).toBe(true);
    });
  });
});

