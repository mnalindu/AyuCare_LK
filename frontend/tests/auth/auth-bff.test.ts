import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { GET as meHandler } from '@/app/api/auth/me/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { backendFetch } from '@/lib/api/http-client';
import * as sessionContract from '@/lib/auth/session-contract';
import { StaffRole } from '@/types/auth';

vi.mock('@/lib/api/http-client', () => ({
  backendFetch: vi.fn(),
}));

describe('Auth BFF Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when body is invalid JSON or violates schema', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({ email: 'invalid-email', password: '' }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.statusCode).toBe(400);
      expect(Array.isArray(data.message)).toBe(true);
    });

    it('sets HttpOnly session cookie and safe profile cookie on successful 200 backend response', async () => {
      const mockBackendUser = {
        id: 'usr-uuid-001',
        email: 'staff.reception@ayucare.lk',
        role: StaffRole.RECEPTIONIST,
      };

      vi.mocked(backendFetch).mockResolvedValueOnce({
        data: {
          accessToken: 'mock.jwt.token.secret',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: mockBackendUser,
        },
        error: null,
        status: 200,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          email: 'staff.reception@ayucare.lk',
          password: 'CorrectPassword123',
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.user).toEqual(mockBackendUser);
      // Access token must NOT be exposed in JSON response body
      expect(json.accessToken).toBeUndefined();

      // Verify cookies are set
      const sessionCookie = response.cookies.get('ayucare_session');
      expect(sessionCookie?.value).toBe('mock.jwt.token.secret');
      expect(sessionCookie?.httpOnly).toBe(true);

      const userCookie = response.cookies.get('ayucare_user_info');
      expect(userCookie?.value).toBe(JSON.stringify(mockBackendUser));
      expect(userCookie?.httpOnly).toBe(false);
    });

    it('returns sanitized error message on backend 401 Unauthorized', async () => {
      vi.mocked(backendFetch).mockResolvedValueOnce({
        data: null,
        error: {
          statusCode: 401,
          message: 'Unauthorized',
        },
        status: 401,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          email: 'staff.reception@ayucare.lk',
          password: 'WrongPassword',
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.message).toContain('Invalid staff email or password credentials');
    });

    it('returns 503 unavailable notice when backend is unavailable', async () => {
      vi.mocked(backendFetch).mockResolvedValueOnce({
        data: null,
        error: {
          statusCode: 503,
          message: 'Service Unavailable',
        },
        status: 503,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
        body: JSON.stringify({
          email: 'staff.reception@ayucare.lk',
          password: 'Password123',
        }),
      });

      const response = await loginHandler(request);
      expect(response.status).toBe(503);

      const json = await response.json();
      expect(json.message).toContain('Staff database service is unavailable');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when no session cookie is present', async () => {
      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce(null);

      const response = await meHandler();
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.message).toContain('No active session');
    });

    it('forwards Bearer token and returns user profile when session exists', async () => {
      const mockUser = {
        id: 'usr-123',
        email: 'doctor@ayucare.lk',
        role: StaffRole.DOCTOR,
      };

      vi.spyOn(sessionContract, 'getServerSessionToken').mockResolvedValueOnce('valid.jwt.token');
      vi.spyOn(sessionContract, 'getBackendAuthHeaders').mockResolvedValueOnce({
        Authorization: 'Bearer valid.jwt.token',
      });

      vi.mocked(backendFetch).mockResolvedValueOnce({
        data: mockUser,
        error: null,
        status: 200,
      });

      const response = await meHandler();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.data).toEqual(mockUser);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears session and user cookies by zeroing maxAge', async () => {
      vi.spyOn(sessionContract, 'getBackendAuthHeaders').mockResolvedValueOnce({
        Authorization: 'Bearer token',
      });
      vi.mocked(backendFetch).mockResolvedValueOnce({
        data: null,
        error: null,
        status: 204,
      });

      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
        },
      });

      const response = await logoutHandler(request);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain('Client session cleared');

      // Verify cookies are zeroed
      const sessionCookie = response.cookies.get('ayucare_session');
      expect(sessionCookie?.maxAge).toBe(0);

      const userCookie = response.cookies.get('ayucare_user_info');
      expect(userCookie?.maxAge).toBe(0);
    });
  });
});

