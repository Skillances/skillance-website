import { useEffect } from 'react';
import Ably from 'ably';
import { apiRequest } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

let sharedClient: Ably.Realtime | null = null;

export function getAppAblyClient(enabled: boolean): Ably.Realtime | null {
  if (!enabled) return null;
  if (sharedClient) return sharedClient;

  sharedClient = new Ably.Realtime({
    authCallback: async (_params, callback) => {
      try {
        const res = await apiRequest(
          ApiPaths.realtime.ablyAuth,
          { method: 'POST', body: JSON.stringify({}) },
          true,
        );
        if (!res.ok) {
          callback('Ably auth failed', null);
          return;
        }
        const tokenRequest = await res.json();
        callback(null, tokenRequest);
      } catch (e: unknown) {
        callback(e instanceof Error ? e.message : String(e), null);
      }
    },
  });

  return sharedClient;
}

export function subscribeChannel(
  client: Ably.Realtime,
  channelName: string,
  event: string,
  handler: (data: unknown) => void,
): () => void {
  const channel = client.channels.get(channelName);
  channel.subscribe(event, (msg) => handler(msg.data));
  return () => channel.unsubscribe(event);
}

export function useAppAblyCleanup() {
  useEffect(() => {
    return () => {
      if (sharedClient) {
        sharedClient.close();
        sharedClient = null;
      }
    };
  }, []);
}
