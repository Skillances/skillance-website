import { useState, useEffect, useCallback } from 'react';

const DEFAULT_COOLDOWN_MS = 60_000; // 1 minute

/**
 * Client-side rate limit for form submissions.
 * Prevents rapid re-submission and shows cooldown state.
 */
export function useFormRateLimit(cooldownMs: number = DEFAULT_COOLDOWN_MS) {
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (cooldownUntil === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) setCooldownUntil(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const startCooldown = useCallback(() => {
    setCooldownUntil(Date.now() + cooldownMs);
  }, [cooldownMs]);

  const startCooldownFromRetryAfter = useCallback((retryAfterSeconds: number) => {
    setCooldownUntil(Date.now() + retryAfterSeconds * 1000);
  }, []);

  const canSubmit = cooldownUntil === null;

  return { canSubmit, secondsRemaining, startCooldown, startCooldownFromRetryAfter };
}
