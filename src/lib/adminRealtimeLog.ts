/**
 * Browser console traces for admin Ably (`private-admin-queue`).
 *
 * Enable with `.env`:
 * `VITE_ADMIN_REALTIME_LOGS=true`
 *
 * Alias (matches backend naming): `VITE_ACCOUNT_REALTIME_LOGS=true`
 *
 * Filter DevTools console: `[skillance.admin.realtime]`
 */

const PREFIX = '[skillance.admin.realtime]';

export function adminRealtimeLogsEnabled(): boolean {
  return (
    import.meta.env.VITE_ADMIN_REALTIME_LOGS === 'true' ||
    import.meta.env.VITE_ACCOUNT_REALTIME_LOGS === 'true'
  );
}

/** Logs envelope-style metadata only (no raw message bodies). */
export function adminRealtimeLog(message: string, detail?: Record<string, unknown>): void {
  if (!adminRealtimeLogsEnabled()) return;
  if (detail !== undefined && Object.keys(detail).length > 0) {
    console.info(PREFIX, message, detail);
  } else {
    console.info(PREFIX, message);
  }
}
