import { z } from 'zod';

export const EmailValidator = z.string()
  .email('Invalid email format')
  .min(5, 'Email too short')
  .max(254, 'Email too long');

export const TextValidator = z.string()
  .min(1, 'Text cannot be empty')
  .max(255, 'Text exceeds maximum length')
  .refine((val) => val.trim().length > 0, 'Text cannot be whitespace only');

export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    EmailValidator.parse(email);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as z.ZodError).message };
  }
}

export function validateText(text: string): { valid: boolean; error?: string } {
  try {
    TextValidator.parse(text);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: (err as z.ZodError).message };
  }
}
