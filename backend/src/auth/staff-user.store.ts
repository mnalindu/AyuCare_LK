import { StaffRole } from './roles';

export interface StaffUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const STAFF_USER_STORE = Symbol('STAFF_USER_STORE');

export interface StaffUserStore {
  findByEmail(email: string): Promise<StaffUserRecord | null>;
  findById(id: string): Promise<StaffUserRecord | null>;
}

