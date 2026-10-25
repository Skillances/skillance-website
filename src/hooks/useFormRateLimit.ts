import { useState, useEffect, useCallback } from 'react';

const DEFAULT_COOLDOWN_MS = 60_000; // 1 minute
const MS_PER_SECOND = 1_000;
/** Ceiling for a server-supplied Retry-After so a bad value cannot lock the form for hours. */
const MAX_RETRY_AFTER_SECONDS = 3_600;

/**
 * Client-side rate limit for form submissions. This is a UX nicety only (it stops accidental
 * double-submits and shows a countdown); it is trivially bypassed, so the backend must enforce
 * the real limit.
 */
export function useFormRateLimit(cooldownMs: number = DEFAULT_COOLDOWN_MS) {
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (cooldownUntil === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / MS_PER_SECOND));
      setSecondsRemaining(remaining);
      if (remaining <= 0) setCooldownUntil(null);
    };
    tick();
    const id = setInterval(tick, MS_PER_SECOND);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const startCooldown = useCallback(() => {
    setCooldownUntil(Date.now() + cooldownMs);
  }, [cooldownMs]);

  const startCooldownFromRetryAfter = useCallback((retryAfterSeconds: number) => {
    const seconds = Math.min(Math.max(retryAfterSeconds, 1), MAX_RETRY_AFTER_SECONDS);
    setCooldownUntil(Date.now() + seconds * MS_PER_SECOND);
  }, []);

  const canSubmit = cooldownUntil === null;

  return { canSubmit, secondsRemaining, startCooldown, startCooldownFromRetryAfter };
}
