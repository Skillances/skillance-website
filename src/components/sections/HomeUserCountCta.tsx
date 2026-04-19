/**
 * Live user count strip (home page, between Hero and Mission).
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

  const countLabel =
    usersCount != null ? usersCount.toLocaleString('en-ZA') : '\u2014';

  return (
    <section
      aria-label="Number of Skillance users"
      className="relative z-10 border-y border-neutral-200/80 bg-white py-6 sm:py-7"
    >
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        {loading ? (
          <div
            className="mx-auto h-9 max-w-[min(20rem,85vw)] rounded-md bg-neutral-100 animate-pulse"
            aria-hidden="true"
          />
        ) : (
          <p className="font-serif text-3xl text-black sm:text-4xl lg:text-[2.75rem] leading-tight tracking-tight">
            <span
              className={`tabular-nums not-italic ${usersCount == null ? 'text-neutral-400' : ''}`}
              title={usersCount == null ? 'Deploy the latest API so this shows your live user total.' : undefined}
            >
              {countLabel}
            </span>
            <span className="text-neutral-500 font-normal"> Skillance users</span>
          </p>
        )}
      </div>
    </section>
  );
};

export default HomeUserCountCta;
