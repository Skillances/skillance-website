import { useCallback, useEffect, useRef, useState } from 'react';
import Ably, {
  type ConnectionState,
  type ConnectionStateChange,
  type Message,
  type TokenRequest,
} from 'ably';
import { apiRequest } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { adminRealtimeLog, adminRealtimeLogsEnabled } from '@/lib/adminRealtimeLog';

const ADMIN_QUEUE_CHANNEL = 'private-admin-queue';

export type AdminAblyConnectionState = ConnectionState | 'inactive';

/**
 * Subscribes admins to Ably {@link ADMIN_QUEUE_CHANNEL} using POST /ably/auth (DB isAdmin-gated).
 * Calls [onHint] when any queue message arrives (verification / role application hints).
 * Returns the current {@link ConnectionState} for UI (e.g. admin top-bar status dot).
 */
export function useAdminAblyQueue(
  onHint: () => void,
  enabled: boolean,
): { connectionState: AdminAblyConnectionState; reconnect: () => void } {
  const [connectionState, setConnectionState] = useState<ConnectionState>('initialized');
  /** Increment to tear down and recreate the Realtime client (manual retry when stuck disconnected). */
  const [reconnectNonce, setReconnectNonce] = useState(0);
  const onHintRef = useRef(onHint);

  useEffect(() => {
    onHintRef.current = onHint;
  }, [onHint]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    adminRealtimeLog('hook_start', { channel: ADMIN_QUEUE_CHANNEL, reconnectNonce });

    const realtime = new Ably.Realtime({
      authCallback: async (_tokenParams, callback) => {
        try {
          const res = await apiRequest(
            ApiPaths.realtime.ablyAuth,
            {
              method: 'POST',
              body: JSON.stringify({}),
            },
            true,
          );
          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            adminRealtimeLog('auth_http_failed', {
              status: res.status,
              hint: errText ? '(see Network tab)' : '',
            });
            callback('Ably auth failed', null);
            return;
          }
          const tokenRequest = (await res.json()) as TokenRequest;
          adminRealtimeLog('auth_ok');
          callback(null, tokenRequest);
        } catch (e: unknown) {
          adminRealtimeLog('auth_exception', {
            message: e instanceof Error ? e.message : String(e),
          });
          callback(e instanceof Error ? e.message : String(e), null);
        }
      },
    });

    const ch = realtime.channels.get(ADMIN_QUEUE_CHANNEL);

    const handler = (message: Message) => {
      const data = message.data;
      let dataSummary: string | undefined;
      if (data != null && typeof data === 'object' && !Array.isArray(data)) {
        dataSummary = Object.keys(data as Record<string, unknown>).slice(0, 28).join(',');
      } else if (data !== undefined && data !== null) {
        dataSummary = typeof data;
      }
      adminRealtimeLog('queue_message', {
        name: message.name ?? '(unnamed)',
        ...(dataSummary !== undefined ? { dataKeys: dataSummary } : {}),
      });
      onHintRef.current();
    };

    const onConnectionChange = (change: ConnectionStateChange) => {
      setConnectionState(change.current);
      if (adminRealtimeLogsEnabled()) {
        adminRealtimeLog('connection', {
          state: change.current,
          previous: change.previous,
          reason: change.reason ?? '',
        });
      }
    };

    const onChannelFailed = (stateChange: { reason?: string | { message?: string } }) => {
      const r = stateChange.reason;
      const msg = typeof r === 'string' ? r : r?.message;
      adminRealtimeLog('channel_failed', { detail: msg ?? '' });
    };

    queueMicrotask(() => {
      setConnectionState(realtime.connection.state);
    });
    realtime.connection.on(onConnectionChange);

    ch.on('failed', onChannelFailed);

    void ch.attach().then(
      () => adminRealtimeLog('channel_attached'),
      (err: Error) =>
        adminRealtimeLog('channel_attach_rejected', { message: err?.message ?? String(err) }),
    );

    ch.subscribe(handler);

    return () => {
      adminRealtimeLog('hook_cleanup');
      ch.off('failed', onChannelFailed);
      realtime.connection.off(onConnectionChange);
      try {
        ch.unsubscribe(handler);
      } catch {
        /* ignore */
      }
      realtime.close();
      queueMicrotask(() => {
        setConnectionState('initialized');
      });
    };
  }, [enabled, reconnectNonce]);

  const reconnect = useCallback(() => {
    setReconnectNonce((n) => n + 1);
  }, []);

  return {
    connectionState: enabled ? connectionState : 'inactive',
    reconnect,
  };
}
