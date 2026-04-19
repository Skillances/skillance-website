import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

/**
 * Compact band between the hero and mission: live marketplace user count + soft CTA.
 * Uses GET /public/stats (usersCount). No icon assets — typography only.
 */
const HomeUserCountCta = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    get(ApiPaths.public.stats)
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data && typeof res.data.usersCount === 'number') {
          setUsersCount(Math.max(0, Math.floor(res.data.usersCount)));
          setLoadState('ready');
        } else {
          setLoadState('error');
        }
      })
      .catch(() => {
        if (!cancelled) setLoadState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatted = usersCount.toLocaleString('en-ZA');

  return (
    <section
      aria-label="Platform community"
      className="relative z-10 border-y border-neutral-200/80 bg-white/95 py-7 sm:py-8 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-6 text-center lg:flex-row lg:gap-10 lg:px-8 lg:text-left">
        <div className="max-w-xl space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Skillance community
          </p>
          {loadState === 'loading' ? (
            <div className="space-y-3 pt-1" aria-hidden="true">
              <div className="mx-auto h-7 w-48 max-w-full rounded-md bg-neutral-100 animate-pulse lg:mx-0" />
              <div className="mx-auto h-5 w-full max-w-md rounded-md bg-neutral-100 animate-pulse lg:mx-0" />
            </div>
          ) : loadState === 'error' ? (
            <p className="font-serif text-2xl text-black sm:text-3xl">
              Join customers and freelancers building trusted work on Skillance.
            </p>
          ) : usersCount === 0 ? (
            <p className="font-serif text-2xl text-black sm:text-3xl">
              Be among the first to shape a marketplace built for trust.
            </p>
          ) : (
            <p className="font-serif text-2xl text-black sm:text-3xl leading-snug">
              <span className="tabular-nums tracking-tight">{formatted}</span>
              <span className="text-neutral-600 not-italic">
                {' '}
                marketplace accounts and counting — freelancers and customers across South Africa.
              </span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:gap-3 lg:flex-col lg:items-end">
          <a
            href="#cta"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black bg-black px-7 text-sm font-medium text-white transition-colors hover:bg-neutral-900"
          >
            Get early access
          </a>
          <a
            href="#mission"
            className="text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-black hover:decoration-neutral-500"
          >
            Why we built Skillance
          </a>
        </div>
      </div>
    </section>
  );
};

export default HomeUserCountCta;
