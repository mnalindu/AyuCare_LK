/**
 * Staff roles defined by AyuCare LK enterprise domain.
 * Must stay aligned with NestJS backend StaffRole enum.
 */
export enum StaffRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  DOCTOR = 'DOCTOR',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  CASHIER = 'CASHIER',
}

/**
 * Public/safe staff profile without sensitive password hashes or internal secrets.
 */
export interface StaffUser {
  id: string;
  email: string;
  role: StaffRole;
}

/**
 * Client-facing session representation.
 * Tokens are kept in HttpOnly cookies, never exposed to JavaScript.
 */
export interface AuthSession {
  user: StaffUser | null;
  isAuthenticated: boolean;
}

/**
 * Login credentials input.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Server-side login response received from NestJS /api/v1/auth/login.
 */
export interface NestLoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: StaffUser;
}

