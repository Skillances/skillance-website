import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ComponentProps,
  type ComponentType,
} from 'react';
import { useIsFetching } from '@tanstack/react-query';
import type { ReactQueryDevtools as ReactQueryDevtoolsComponent } from '@tanstack/react-query-devtools';

const ReactQueryDevtools = lazy(async () => {
  const mod = await import('@tanstack/react-query-devtools');
  return { default: mod.ReactQueryDevtools };
}) as ComponentType<ComponentProps<typeof ReactQueryDevtoolsComponent>>;

const SLOW_FETCH_MS = 6000;

/**
 * Admin-only: visual feedback when TanStack Query has in-flight requests, optional
 * slow-API hint, and React Query Devtools (local dev or when VITE_ADMIN_RQ_DEVTOOLS=true).
 */
function AdminFetchBar() {
  const fetchingCount = useIsFetching();
  const [warnSlow, setWarnSlow] = useState(false);

  useEffect(() => {
    if (fetchingCount === 0) {
      return;
    }
    const timer = window.setTimeout(() => setWarnSlow(true), SLOW_FETCH_MS);
    return () => {
      window.clearTimeout(timer);
      setWarnSlow(false);
    };
  }, [fetchingCount]);

  if (fetchingCount === 0) {
    return null;
  }

  const showDevtoolsHint =
    import.meta.env.DEV || import.meta.env.VITE_ADMIN_RQ_DEVTOOLS === 'true';

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[200] h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-sky-500 motion-safe:animate-pulse pointer-events-none"
        role="progressbar"
        aria-busy="true"
        aria-valuetext="Loading data from the API"
      />
      {warnSlow ? (
        <div
          className="fixed top-1 left-1/2 -translate-x-1/2 z-[200] max-w-lg px-3 py-2 rounded-b-lg bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-100 text-xs text-center shadow-md border border-amber-300 dark:border-amber-800"
          role="status"
        >
          Requests are taking longer than usual. Check API or network load.
          {showDevtoolsHint ? ' Use the Query panel (bottom-left) to inspect active queries.' : ''}
        </div>
      ) : null}
    </>
  );
}

export function AdminQueryMonitor() {
  const showDevtools = import.meta.env.DEV || import.meta.env.VITE_ADMIN_RQ_DEVTOOLS === 'true';

  return (
    <>
      <AdminFetchBar />
      {showDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </Suspense>
      ) : null}
    </>
  );
}
