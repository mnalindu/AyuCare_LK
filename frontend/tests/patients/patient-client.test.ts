import { describe, it, expect } from 'vitest';
import {
  formatPatientNumber,
  calculateAgeFromDob,
} from '@/features/patients/services/patient-client';

describe('Patient Client Helpers', () => {
  describe('formatPatientNumber', () => {
    it('returns Assigned after registration for missing or non-positive numbers', () => {
      expect(formatPatientNumber(null)).toBe('Assigned after registration');
      expect(formatPatientNumber(undefined)).toBe('Assigned after registration');
      expect(formatPatientNumber(0)).toBe('Assigned after registration');
    });

    it('formats real backend numeric identifiers accurately', () => {
      expect(formatPatientNumber(1)).toBe('Patient #1');
      expect(formatPatientNumber(41)).toBe('Patient #41');
      expect(formatPatientNumber(1428)).toBe('Patient #1428');
    });
  });

  describe('calculateAgeFromDob', () => {
    it('returns Not provided for nullish inputs', () => {
      expect(calculateAgeFromDob(null)).toBe('Not provided');
      expect(calculateAgeFromDob(undefined)).toBe('Not provided');
      expect(calculateAgeFromDob('')).toBe('Not provided');
      expect(calculateAgeFromDob('invalid-date')).toBe('Not provided');
    });

    it('calculates age in years for adult DOBs', () => {
      const ageStr = calculateAgeFromDob('1990-01-01');
      expect(ageStr).toMatch(/^\d+\s+yrs$/);
    });
  });
});
