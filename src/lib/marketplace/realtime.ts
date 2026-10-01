import { useEffect, useRef } from 'react';
import Ably, { type ErrorInfo, type Message, type TokenParams, type TokenRequest } from 'ably';
import { apiRequest } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

/**
 * Subscribe-only Ably connection authorised by `POST /ably/auth` with `{}` (the same body the app sends).
 * The API grants signed-in users `private-chat:*`, `public:availability:*`, and their own booking channels.
 */
function createRealtime(): Ably.Realtime {
  return new Ably.Realtime({
    authCallback: async (
      _params: TokenParams,
      callback: (error: ErrorInfo | string | null, token: TokenRequest | string | null) => void,
    ) => {
      try {
        const res = await apiRequest(ApiPaths.realtime.ablyAuth, { method: 'POST', body: JSON.stringify({}) }, true);
        if (!res.ok) {
          callback('Realtime sign-in failed', null);
          return;
        }
        callback(null, (await res.json()) as TokenRequest);
      } catch (e) {
        callback(e instanceof Error ? e.message : String(e), null);
      }
    },
  });
}

/** Ably may deliver `data` as a JSON string; returns an object either way. */
export function parseAblyData<T = Record<string, unknown>>(data: unknown): T | null {
  if (data == null) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }
  return typeof data === 'object' ? (data as T) : null;
}

/**
 * Subscribes to [channelName] while mounted and [enabled]; unsubscribes and closes on unmount or change.
 * [onMessage] can change between renders without resubscribing.
 */
export function useAblyChannel(channelName: string | null, onMessage: (msg: Message) => void, enabled = true): void {
  const handlerRef = useRef(onMessage);
  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled || !channelName) return;
    const realtime = createRealtime();
    const channel = realtime.channels.get(channelName);
    const handler = (m: Message) => handlerRef.current(m);
    void channel.subscribe(handler).catch(() => {
      /* The REST data still loads; realtime is best effort. */
    });
    return () => {
      try {
        channel.unsubscribe(handler);
        void channel.detach().catch(() => {});
      } catch {
        /* ignore */
      }
      realtime.close();
    };
  }, [channelName, enabled]);
}
