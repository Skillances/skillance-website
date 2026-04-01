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
    message: payload.message,
    stack: payload.stack,
    componentStack: payload.componentStack,
    metadata: payload.metadata,
  };

  const serialized = safeJson(body);

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([serialized], { type: 'text/plain;charset=UTF-8' });
      navigator.sendBeacon(CLIENT_LOG_ENDPOINT, blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  void fetch(CLIENT_LOG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: serialized,
    keepalive: true,
  }).catch(() => {
    // Logging must never crash the app.
  });
}
