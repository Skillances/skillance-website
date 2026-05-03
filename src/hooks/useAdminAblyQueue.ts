import { useEffect, useRef } from 'react';
import Ably, { type TokenRequest } from 'ably';
import { apiRequest } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

const ADMIN_QUEUE_CHANNEL = 'private-admin-queue';

/**
 * Subscribes admins to Ably {@link ADMIN_QUEUE_CHANNEL} using POST /ably/auth (DB isAdmin-gated).
 * Calls [onHint] when any queue message arrives (verification / role application hints).
 */
export function useAdminAblyQueue(onHint: () => void, enabled: boolean): void {
  const rtRef = useRef<Ably.Realtime | null>(null);
  const onHintRef = useRef(onHint);
  onHintRef.current = onHint;

  useEffect(() => {
    if (!enabled) {
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

    rtRef.current = realtime;
    const ch = realtime.channels.get(ADMIN_QUEUE_CHANNEL);

    const handler = () => {
      onHintRef.current();
    };

    ch.subscribe(handler);

    return () => {
      try {
        ch.unsubscribe(handler);
      } catch {
        /* ignore */
      }
      realtime.close();
      rtRef.current = null;
    };
  }, [enabled]);
}
