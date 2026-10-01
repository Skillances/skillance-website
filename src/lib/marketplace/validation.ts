/**
 * Client checks that mirror the API schemas (skillance-backend utils/validation-helpers.ts,
 * routes/auth.routes.ts) and the app validators (skillance-app lib/core/utils/validators.dart).
 * The API stays authoritative; its field message replaces these on submit.
 */

export const PASSWORD_RULES: { id: string; label: string; test: (v: string) => boolean }[] = [
  { id: 'len', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'num', label: 'One number', test: (v) => /[0-9]/.test(v) },
  { id: 'special', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

export function validatePassword(v: string): string | null {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters long';
  if (v.length > 128) return 'Password must be at most 128 characters';
  if (!/[A-Z]/.test(v)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(v)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must contain at least one special character';
  return null;
}

export function validateEmail(v: string): string | null {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Please enter a valid email address';
  return null;
}

export function validateName(v: string, which: 'First' | 'Last'): string | null {
  const t = v.trim();
  if (!t) return `${which} name is required`;
  if (t.length < 2) return `${which} name must be at least 2 characters`;
  if (t.length > 100) return `${which} name must be at most 100 characters`;
  return null;
}

/** South African number: +27XXXXXXXXX or 0XXXXXXXXX (spaces ignored). */
export function validatePhone(v: string): string | null {
  if (!v.trim()) return 'Phone number is required';
  if (!/^(\+27|0)[0-9]{9}$/.test(v.replace(/\s+/g, ''))) return 'Please enter a valid South African phone number';
  return null;
}

/** App rule for registration and profile rates: R50 to R2000 per hour. */
export function validateHourlyRate(v: string): string | null {
  if (!v.trim()) return 'Hourly rate is required';
  const n = Number(v);
  if (!Number.isFinite(n)) return 'Please enter a valid number';
  if (n < 50) return 'Minimum rate is R50/hour';
  if (n > 2000) return 'Maximum rate is R2000/hour';
  return null;
}

/** Whole years between [dob] (YYYY-MM-DD) and today, or null when unparseable. */
export function ageFromDob(dob: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) age--;
  return age;
}

/** Profile images: the API takes `data:image/...` base64 up to 10 MB. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Choose an image file (JPG, PNG, or WebP).';
  // Base64 grows ~4/3; keep the encoded string under the API limit.
  if (file.size * 1.37 > MAX_IMAGE_BYTES) return 'Image must be smaller than 7 MB.';
  return null;
}
