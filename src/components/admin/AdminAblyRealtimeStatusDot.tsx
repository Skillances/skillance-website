import type { ConnectionState } from 'ably';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import type { AdminAblyConnectionState } from '@/hooks/useAdminAblyQueue';

function describeConnectionState(state: AdminAblyConnectionState): { title: string; detail: string } {
  if (state === 'inactive') {
    return {
      title: 'Ably realtime inactive',
      detail: 'Connect as an admin to open the realtime client.',
    };
  }
  const map: Record<ConnectionState, { title: string; detail: string }> = {
    connected: {
      title: 'Ably realtime connected',
      detail: 'Realtime is active (admin queue and live updates).',
    },
    initialized: {
      title: 'Ably realtime starting',
      detail: 'Connection is initializing.',
    },
    connecting: {
      title: 'Ably realtime connecting',
      detail: 'Establishing connection to Ably.',
    },
    disconnected: {
      title: 'Ably realtime disconnected',
      detail: 'No active connection; the client will retry automatically.',
    },
    suspended: {
      title: 'Ably realtime suspended',
      detail: 'Long outage; the client will retry on a slower schedule.',
    },
    closing: {
      title: 'Ably realtime closing',
      detail: 'Connection is shutting down.',
    },
    closed: {
      title: 'Ably realtime closed',
      detail: 'The connection was closed.',
    },
    failed: {
      title: 'Ably realtime failed',
      detail: 'Check auth, network, or Ably configuration.',
    },
  };
  return map[state];
}

function dotClassForState(state: AdminAblyConnectionState): string {
  if (state === 'inactive') {
    return 'bg-neutral-400 dark:bg-neutral-500';
  }
  switch (state) {
    case 'connected':
      return 'bg-emerald-500 dark:bg-emerald-400';
    case 'failed':
    case 'closed':
    case 'closing':
      return 'bg-red-500 dark:bg-red-500';
    case 'disconnected':
    case 'suspended':
      return 'bg-amber-500 dark:bg-amber-400';
    default:
      return 'bg-neutral-400 dark:bg-neutral-500';
  }
}

/** Status dot for admin Ably realtime; green when connected, otherwise reflects recovery or failure. */
export function AdminAblyRealtimeStatusDot({
  connectionState,
  onReconnect,
  className,
}: {
  connectionState: AdminAblyConnectionState;
  /** When set, shows "Retry connection" for recoverable failure / disconnected states. */
  onReconnect?: () => void;
  className?: string;
}) {
  const { title, detail } = describeConnectionState(connectionState);
  const dotClass = dotClassForState(connectionState);

  const showReconnect =
    typeof onReconnect === 'function' &&
    connectionState !== 'inactive' &&
    !['connected', 'initialized', 'connecting'].includes(connectionState as string);

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-center rounded-xl p-1.5 lg:p-2 text-neutral-500 transition-opacity dark:text-neutral-400',
            'outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950',
            'opacity-100',
            className,
          )}
          aria-label={`${title}. State: ${connectionState}. Hover for details.`}
        >
          <span
            className={cn('h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/15', dotClass)}
          />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="center"
        sideOffset={8}
        className="max-w-xs border-neutral-200 bg-white p-3 text-left text-neutral-900 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">{detail}</p>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500 tabular-nums">
          Connection state: <span className="text-neutral-900 dark:text-neutral-200">{connectionState}</span>
        </p>
        {showReconnect ? (
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
            onClick={(e) => {
              e.preventDefault();
              onReconnect?.();
            }}
          >
            Retry connection
          </button>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}
