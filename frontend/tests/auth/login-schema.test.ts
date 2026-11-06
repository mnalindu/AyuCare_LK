import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/lib/validation/auth-schema';

describe('loginSchema validation', () => {
  it('accepts valid staff credentials', () => {
    const input = {
      email: 'doctor.perera@ayucare.lk',
      password: 'SecurePassword123!',
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('doctor.perera@ayucare.lk');
      expect(result.data.password).toBe('SecurePassword123!');
    }
  });

  it('normalizes email to lowercase and trims surrounding whitespace', () => {
    const input = {
      email: '  Staff.Admin@AyuCare.LK  ',
      password: 'mypassword',
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('staff.admin@ayucare.lk');
    }
  });

  it('rejects empty or missing email', () => {
    const input = {
      email: '',
      password: 'ValidPassword123',
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/email address is required/i);
    }
  });

  it('rejects invalid email formats', () => {
    const input = {
      email: 'not-an-email',
      password: 'ValidPassword123',
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/valid clinic staff email/i);
    }
  });

  it('rejects empty or missing password', () => {
    const input = {
      email: 'reception@ayucare.lk',
      password: '',
    };

    const result = loginSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toMatch(/password is required/i);
    }
  });
});

