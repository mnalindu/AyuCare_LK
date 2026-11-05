import { describe, it, expect } from 'vitest';
import {
  createPatientSchema,
  updatePatientSchema,
  getTodayColombo,
  sanitizePhone,
} from '@/lib/validation/patient-schema';

describe('Patient Zod Validation Schemas', () => {
  describe('createPatientSchema', () => {
    it('accepts valid input with all whitelisted fields', () => {
      const input = {
        fullName: '  Nimali   Perera  ',
        dateOfBirth: '1990-04-15',
        phone: '+94 77 123 4567',
        email: 'NIMALI@EXAMPLE.COM',
        address: 'Colombo, Sri Lanka',
      };

      const result = createPatientSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Nimali Perera');
        expect(result.data.phone).toBe('+94771234567');
        expect(result.data.email).toBe('nimali@example.com');
        expect(result.data.dateOfBirth).toBe('1990-04-15');
      }
    });

    it('requires fullName and rejects empty string', () => {
      const input = {
        fullName: '   ',
      };
      const result = createPatientSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors.find((e) => e.path.includes('fullName'));
        expect(error?.message).toContain('Full name is required');
      }
    });

    it('rejects fullName longer than 200 characters', () => {
      const input = {
        fullName: 'A'.repeat(201),
      };
      const result = createPatientSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors.find((e) => e.path.includes('fullName'));
        expect(error?.message).toContain('must not exceed 200 characters');
      }
    });

    it('rejects future dateOfBirth in Asia/Colombo', () => {
      const today = getTodayColombo();
      const futureDate = '2099-01-01';
      const input = {
        fullName: 'Test Patient',
        dateOfBirth: futureDate,
      };
      const result = createPatientSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.errors.find((e) => e.path.includes('dateOfBirth'));
        expect(error?.message).toContain('cannot be in the future');
      }
    });

    it('sanitizes and validates phone with 7 to 15 digits', () => {
      expect(sanitizePhone('(077) 123-4567')).toBe('0771234567');
      expect(sanitizePhone('+94 (71) 987-6543')).toBe('+94719876543');
      expect(sanitizePhone('')).toBe(null);

      const invalidPhone = {
        fullName: 'Test Patient',
        phone: '123', // too short (<7 digits)
      };
      const result = createPatientSchema.safeParse(invalidPhone);
      expect(result.success).toBe(false);
    });

    it('validates email format and normalizes to lowercase', () => {
      const invalidEmail = {
        fullName: 'Test Patient',
        email: 'not-an-email',
      };
      const result = createPatientSchema.safeParse(invalidEmail);
      expect(result.success).toBe(false);
    });

    it('rejects address exceeding 1000 characters', () => {
      const input = {
        fullName: 'Test Patient',
        address: 'X'.repeat(1001),
      };
      const result = createPatientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePatientSchema', () => {
    it('allows partial updates with a single field', () => {
      const input = {
        phone: '+94779998877',
      };
      const result = updatePatientSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('rejects empty update payload with 0 fields', () => {
      const input = {};
      const result = updatePatientSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least one updated field');
      }
    });

    it('rejects fullName if explicitly set to empty string or null', () => {
      const input = {
        fullName: '',
      };
      const result = updatePatientSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });
});

