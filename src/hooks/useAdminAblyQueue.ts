import { useEffect, useRef, useState } from 'react';
import Ably, { type ConnectionState, type TokenRequest } from 'ably';
import { apiRequest } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

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
): { connectionState: AdminAblyConnectionState } {
  const [connectionState, setConnectionState] = useState<AdminAblyConnectionState>(() =>
    enabled ? 'initialized' : 'inactive',
  );
  const onHintRef = useRef(onHint);
  onHintRef.current = onHint;

  useEffect(() => {
    if (!enabled) {
      setConnectionState('inactive');
      return;
    }

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
            callback('Ably auth failed', null);
            return;
          }
          const tokenRequest = (await res.json()) as TokenRequest;
          callback(null, tokenRequest);
        } catch (e: unknown) {
          callback(e instanceof Error ? e.message : String(e), null);
        }
      },
    });

    const ch = realtime.channels.get(ADMIN_QUEUE_CHANNEL);

    const handler = () => {
      onHintRef.current();
    };

    const onConnectionChange = (change: { current: ConnectionState }) => {
      setConnectionState(change.current);
    };

    setConnectionState(realtime.connection.state);
    realtime.connection.on(onConnectionChange);

    ch.subscribe(handler);

    return () => {
      realtime.connection.off(onConnectionChange);
      try {
        ch.unsubscribe(handler);
      } catch {
        /* ignore */
      }
      realtime.close();
    };
  }, [enabled]);

  return { connectionState };
}
