import { z } from 'zod';

/**
 * Zod validation schema for staff login credentials matching NestJS LoginDto.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid clinic staff email address' })
    .transform((val) => val.toLowerCase()),

  password: z
    .string()
    .min(1, { message: 'Security password is required' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

