/** True when the API refused the call because the feature is paused (HTTP 403, code FEATURE_PAUSED). */
export function isFeaturePaused(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const body = err as { code?: unknown; error?: unknown; statusCode?: unknown; status?: unknown };
  const code = body.code === 'FEATURE_PAUSED' || body.error === 'FEATURE_PAUSED';
  if (!code) return false;
  const status = body.statusCode ?? body.status;
  return status == null || status === 403;
}
