import { describe, expect, it } from 'vitest';
import { CONTACT_LIMITS, PREFILL_MAX_LENGTH, contactFormSchema, sanitizePrefill } from './contactForm';

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Hello',
  message: 'This is a long enough message.',
};

describe('contactFormSchema', () => {
  it('accepts a valid submission and trims it', () => {
    const result = contactFormSchema.safeParse({ ...valid, name: '  Ada  ' });
    expect(result.success && result.data.name).toBe('Ada');
  });

  it.each([
    ['empty name', { name: '   ' }],
    ['bad email', { email: 'not-an-email' }],
    ['long subject', { subject: 'x'.repeat(CONTACT_LIMITS.subject + 1) }],
    ['short message', { message: 'hi' }],
    ['long message', { message: 'x'.repeat(CONTACT_LIMITS.message + 1) }],
  ])('rejects %s', (_label, override) => {
    expect(contactFormSchema.safeParse({ ...valid, ...override }).success).toBe(false);
  });

  it('removes line breaks from single-line fields but keeps them in the message', () => {
    const result = contactFormSchema.safeParse({
      ...valid,
      subject: 'Hi\r\nBcc: victim@example.com',
      message: 'Line one\nLine two is here',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.subject).toBe('Hi Bcc: victim@example.com');
      expect(result.data.message).toContain('\n');
    }
  });
});

describe('sanitizePrefill', () => {
  it('strips control characters and caps length', () => {
    expect(sanitizePrefill('a\u0000b\nc')).toBe('a b c');
    expect(sanitizePrefill('x'.repeat(1_000))).toHaveLength(PREFILL_MAX_LENGTH);
    expect(sanitizePrefill(null)).toBe('');
  });
});
