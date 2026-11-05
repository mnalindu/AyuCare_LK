import { z } from 'zod';

/**
 * Returns today's date formatted as YYYY-MM-DD in the Asia/Colombo timezone.
 */
export function getTodayColombo(): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

/**
 * Helper to clean phone numbers: strips whitespace, hyphens, and parentheses.
 */
export function sanitizePhone(val?: string | null): string | null {
  if (!val) return null;
  const cleaned = val.replace(/[\s()-]/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Schema for creating a new patient record matching NestJS CreatePatientDto.
 */
export const createPatientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .transform((v) => v.replace(/\s+/g, ' '))
    .refine((v) => v.length >= 1, { message: 'Full name is required' })
    .refine((v) => v.length <= 200, { message: 'Full name must not exceed 200 characters' }),

  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null))
    .refine(
      (val) => {
        if (!val) return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(val);
      },
      { message: 'Date of birth must follow YYYY-MM-DD format' }
    )
    .refine(
      (val) => {
        if (!val) return true;
        return val <= getTodayColombo();
      },
      { message: 'Date of birth cannot be in the future (Asia/Colombo)' }
    ),

  phone: z
    .string()
    .optional()
    .nullable()
    .transform(sanitizePhone)
    .refine(
      (val) => {
        if (!val) return true;
        return /^\+?[0-9]{7,15}$/.test(val);
      },
      { message: 'Phone must contain 7 to 15 digits with an optional leading +' }
    ),

  email: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim().toLowerCase() : null))
    .refine(
      (val) => {
        if (!val) return true;
        return z.string().email().safeParse(val).success;
      },
      { message: 'Please provide a valid email address' }
    )
    .refine(
      (val) => {
        if (!val) return true;
        return val.length <= 254;
      },
      { message: 'Email must not exceed 254 characters' }
    ),

  address: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null))
    .refine(
      (val) => {
        if (!val) return true;
        return val.length <= 1000;
      },
      { message: 'Address must not exceed 1000 characters' }
    ),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>;

/**
 * Schema for updating an existing patient record matching NestJS UpdatePatientDto.
 */
export const updatePatientSchema = createPatientSchema
  .partial()
  .refine(
    (data) => {
      // Must provide at least one non-undefined property
      const keys = Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined);
      return keys.length > 0;
    },
    { message: 'Please provide at least one updated field' }
  )
  .refine(
    (data) => {
      // fullName cannot be null or empty if provided
      if (data.fullName !== undefined) {
        return typeof data.fullName === 'string' && data.fullName.trim().length > 0;
      }
      return true;
    },
    { message: 'Full name cannot be empty or null' }
  );

export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;

