type ClientLogLevel = 'error' | 'warn';

interface ClientLogPayload {
  level?: ClientLogLevel;
  source: string;
  route?: string;
  message: string;
  stack?: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
}

const CLIENT_LOG_ENDPOINT = '/api/client-log';
/** Same-origin, so no CORS preflight; the endpoint only accepts JSON. */
const JSON_CONTENT_TYPE = 'application/json';

/** Keep payloads under the endpoint's 16KB body cap (it also truncates server-side). */
const MAX_FIELD_LENGTH = 4_000;

function clip(value: string | undefined): string | undefined {
  return value && value.length > MAX_FIELD_LENGTH ? value.slice(0, MAX_FIELD_LENGTH) : value;
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[unserializable]"';
  }
}

export function sendClientLog(payload: ClientLogPayload): void {
  if (typeof window === 'undefined') return;

  const body = {
    level: payload.level ?? 'error',
    source: payload.source,
    route: payload.route ?? window.location.pathname,
    message: clip(payload.message),
    stack: clip(payload.stack),
    componentStack: clip(payload.componentStack),
    metadata: payload.metadata,
  };

  const serialized = safeJson(body);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([serialized], { type: JSON_CONTENT_TYPE });
      navigator.sendBeacon(CLIENT_LOG_ENDPOINT, blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch(CLIENT_LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body: serialized,
    keepalive: true,
  }).catch(() => {
    // Logging must never crash the app.
  });
}
