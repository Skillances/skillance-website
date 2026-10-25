import { z } from 'zod';

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  subject: 150,
  message: 2_000,
} as const;

/** Longest `?subject=` / `?context=` value we will copy into the form. */
export const PREFILL_MAX_LENGTH = 150;

// eslint-disable-next-line no-control-regex -- intentionally matching control characters to strip them
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;
// eslint-disable-next-line no-control-regex -- single-line fields also lose newlines and tabs
const LINE_CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F\u2028\u2029\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g;

/** Single-line text: no control characters or line breaks, collapsed whitespace. */
export function cleanLine(value: string): string {
  return value.replace(LINE_CONTROL_CHARS, ' ').replace(/\s+/g, ' ').trim();
}

/** Multi-line text: keeps newlines and tabs, drops other control characters. */
export function cleanMultiline(value: string): string {
  return value.replace(/\r\n?/g, '\n').replace(CONTROL_CHARS, '').trim();
}

/** Untrusted URL prefill: cleaned, capped, and empty when absent. */
export function sanitizePrefill(value: string | null, maxLength = PREFILL_MAX_LENGTH): string {
  return value ? cleanLine(value).slice(0, maxLength) : '';
}

const line = (field: string, max: number) =>
  z
    .string()
    .transform(cleanLine)
    .pipe(z.string().min(1, `${field} is required`).max(max, `${field} must be at most ${max} characters`));

export const contactFormSchema = z.object({
  name: line('Name', CONTACT_LIMITS.name),
  email: z
    .string()
    .transform(cleanLine)
    .pipe(
      z
        .string()
        .max(CONTACT_LIMITS.email, 'Email is too long')
        .pipe(z.email('Enter a valid email address')),
    ),
  subject: line('Subject', CONTACT_LIMITS.subject),
  message: z
    .string()
    .transform(cleanMultiline)
    .pipe(
      z
        .string()
        .min(10, 'Message must be at least 10 characters')
        .max(CONTACT_LIMITS.message, `Message must be at most ${CONTACT_LIMITS.message} characters`),
    ),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** First validation message, for a toast. */
export function firstContactError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Please check the form and try again.';
}
