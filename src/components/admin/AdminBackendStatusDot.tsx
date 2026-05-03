import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { ApiPaths } from '@/lib/apiEndpoints';
import { getApiBaseUrl } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';

/** Round-trip above this is shown as "slow" (orange). */
const SLOW_THRESHOLD_MS = 2000;

/** How often to re-check while admin is open (10 minutes). */
const PING_INTERVAL_MS = 10 * 60 * 1000;

export type BackendPingResult = {
  latencyMs: number;
  reachable: boolean;
  httpStatus: number;
};

async function pingBackendHealth(): Promise<BackendPingResult> {
  const base = getApiBaseUrl();
  const t0 = performance.now();
  try {
    const res = await fetch(`${base}${ApiPaths.health}`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    });
    const latencyMs = Math.round(performance.now() - t0);
    return { latencyMs, reachable: res.ok, httpStatus: res.status };
  } catch {
    const latencyMs = Math.round(performance.now() - t0);
    return { latencyMs, reachable: false, httpStatus: 0 };
  }
}

function formatLatency(ms: number | undefined): string {
  if (ms === undefined) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${ms} ms`;
}

/**
 * Green / orange / red dot for API reachability and latency; hover opens a card with last measured round-trip and a manual "Check now" control.
 */
export function AdminBackendStatusDot({ className }: { className?: string }) {
  const { data, isPending, isFetching, dataUpdatedAt, refetch } = useQuery({
    queryKey: queryKeys.backend.healthPing(),
    queryFn: pingBackendHealth,
    refetchInterval: PING_INTERVAL_MS,
    refetchIntervalInBackground: true,
    staleTime: 15_000,
    retry: 1,
    retryDelay: 800,
  });

  const latencyMs = data?.latencyMs;
  const reachable = data?.reachable ?? false;

  const status: 'checking' | 'online' | 'slow' | 'offline' =
    isPending && !data ? 'checking' : !reachable ? 'offline' : latencyMs !== undefined && latencyMs >= SLOW_THRESHOLD_MS ? 'slow' : 'online';

  const title =
    status === 'checking'
      ? 'Checking Skillance API'
      : status === 'offline'
        ? 'Skillance API offline or error'
        : status === 'slow'
          ? 'Skillance API slow'
          : 'Skillance API online';

  const lastCheckLabel =
    dataUpdatedAt > 0 ? new Date(dataUpdatedAt).toLocaleString(undefined, { timeStyle: 'medium', dateStyle: 'short' }) : '—';

  const dotClass =
    status === 'checking'
      ? 'bg-neutral-400 dark:bg-neutral-500'
      : status === 'offline'
        ? 'bg-red-500 dark:bg-red-500'
        : status === 'slow'
          ? 'bg-amber-500 dark:bg-amber-400'
          : 'bg-emerald-500 dark:bg-emerald-400';

  return (
    <HoverCard openDelay={200} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex items-center justify-center rounded-xl p-1.5 lg:p-2 text-neutral-500 transition-opacity dark:text-neutral-400',
            'outline-none hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-950',
            isFetching ? 'opacity-70' : 'opacity-100',
            className,
          )}
          aria-label={`${title}. Last response ${formatLatency(latencyMs)}. Hover or press for details and refresh.`}
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
        <p className="mt-1.5 text-xs text-neutral-600 dark:text-neutral-400">
          Last response time: <span className="tabular-nums text-neutral-900 dark:text-neutral-100">{formatLatency(latencyMs)}</span>
        </p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Last check: <span className="tabular-nums text-neutral-900 dark:text-neutral-100">{lastCheckLabel}</span>
        </p>
        {data && !data.reachable && data.httpStatus > 0 ? (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">HTTP status: {data.httpStatus}</p>
        ) : null}
        <div className="mt-3 flex justify-end border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700',
              'transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800',
              'disabled:pointer-events-none disabled:opacity-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-500 dark:focus-visible:ring-offset-neutral-900',
            )}
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
          >
            <RefreshCw className={cn('h-3.5 w-3.5 shrink-0', isFetching && 'animate-spin')} aria-hidden />
            Check now
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
