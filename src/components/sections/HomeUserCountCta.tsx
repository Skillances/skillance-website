/**
 * Live user count (home, between Hero and Mission). Visual rhythm matches Stats ("by the numbers").
 * Path: src/components/sections/HomeUserCountCta.tsx
 */
import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

function parseUsersCount(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null;
  const raw = (data as Record<string, unknown>).usersCount;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.max(0, Math.floor(raw));
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return Math.max(0, Math.floor(n));
  }
  return null;
}

const HomeUserCountCta = () => {
  const [usersCount, setUsersCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    get(ApiPaths.public.stats)
      .then((res) => {
        if (cancelled) return;
        const n = res.success && res.data ? parseUsersCount(res.data) : null;
        setUsersCount(n);
      })
      .catch(() => {
        if (!cancelled) setUsersCount(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const countDisplay =
    usersCount != null ? usersCount.toLocaleString('en-ZA') : '\u2014';

  const rightLabel =
    usersCount == null
      ? 'Live figure temporarily unavailable — please refresh in a moment.'
      : 'customers and freelancers on Skillance today';

  return (
    <section
      aria-label="Current Skillance user count"
      className="relative z-10 border-t border-neutral-100 bg-white py-20 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl text-black leading-[1.1]">
              Current{' '}
              <span className="italic">Skillance users</span>
            </h2>
            <p className="text-neutral-500 text-lg mt-4 max-w-md">
              Live marketplace total — staff accounts are excluded.
            </p>
          </div>

          <div className="lg:pt-1">
            {loading ? (
              <div className="flex items-baseline gap-4" aria-hidden="true">
                <div className="min-h-[3.5rem] w-24 sm:w-32 lg:w-40 rounded-sm bg-neutral-100 animate-pulse self-end" />
                <div className="h-6 flex-1 max-w-[220px] rounded-sm bg-neutral-100 animate-pulse" />
              </div>
            ) : (
              <div className="flex items-baseline gap-4">
                <span
                  className={`font-serif text-5xl sm:text-7xl lg:text-8xl tabular-nums leading-none ${
                    usersCount == null ? 'text-neutral-300' : 'text-black'
                  }`}
                >
                  {countDisplay}
                </span>
                <span className="text-neutral-500 text-lg max-w-[220px] leading-snug">
                  {rightLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeUserCountCta;
