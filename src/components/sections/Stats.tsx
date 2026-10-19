import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { SHOW_PUBLIC_STATS } from '@/lib/featureFlags';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealFromTo } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

function parseFiniteNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseUsersCount(data: Record<string, unknown>): number | null {
  const n = parseFiniteNumber(data.usersCount);
  if (n === null) return null;
  return Math.max(0, Math.floor(n));
}

function formatStat(stat: Stat, animated: number): string {
  if (stat.suffix === '%') return `${animated}${stat.suffix}`;
  if (!Number.isInteger(stat.value)) return animated.toFixed(1);
  return Math.round(animated).toLocaleString('en-ZA');
}

function statsFromPayload(data: unknown): Stat[] {
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  const next: Stat[] = [];

  const users = parseUsersCount(record);
  if (users !== null) {
    next.push({ value: users, suffix: '', label: 'people on Skillance' });
  }

  const verified = parseFiniteNumber(record.verifiedPercent);
  if (verified !== null) {
    next.push({
      value: verified,
      suffix: '%',
      label: 'of providers verified',
    });
  }

  const bookings = parseFiniteNumber(record.bookingsCount);
  if (bookings !== null) {
    next.push({
      value: Math.max(0, Math.floor(bookings)),
      suffix: '',
      label: 'bookings',
    });
  }

  const rating = parseFiniteNumber(record.avgRating);
  if (rating !== null) {
    next.push({ value: rating, suffix: '', label: 'average rating' });
  }

  return next;
}

const Stats = () => {
  if (!SHOW_PUBLIC_STATS) return null;
  return <LiveStats />;
};

/**
 * Renders only numbers returned by `/public/stats`. If the request fails or a
 * field is missing, that counter is omitted. Nothing is filled in from a
 * hardcoded fallback.
 *
 * The animation effect depends on the live values. An earlier version listed
 * only `stats.length`, so the scroll trigger kept the first render's numbers
 * and never picked up the API response.
 */
function LiveStats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);
  const hasAnimated = useRef(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;
    get(ApiPaths.public.stats)
      .then((res) => {
        if (cancelled || !res.success || !res.data) return;
        const next = statsFromPayload(res.data);
        if (next.length === 0) return;
        setStats(next);
        setAnimatedValues(next.map(() => 0));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!stats || stats.length === 0) return;

    hasAnimated.current = false;
    const current = stats;

    const ctx = gsap.context(() => {
      revealFromTo('.stats-header', '.stats-header', reducedMotion);

      const anim: Record<string, number> = {};
      current.forEach((_, i) => {
        anim[`v${i}`] = 0;
      });

      const play = () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;
        const endValues = Object.fromEntries(
          current.map((s, i) => [`v${i}`, s.value]),
        ) as Record<string, number>;
        gsap.to(anim, {
          duration: reducedMotion ? 0 : 2,
          ease: 'power2.out',
          ...endValues,
          onUpdate: () => {
            setAnimatedValues(
              current.map((s, i) =>
                Number(anim[`v${i}`].toFixed(Number.isInteger(s.value) ? 0 : 1)),
              ),
            );
          },
        });
      };

      ScrollTrigger.create({
        trigger: '.stats-container',
        start: 'top 80%',
        onEnter: play,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion, stats]);

  if (!stats || stats.length === 0) return null;

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div className="stats-header">
            <h2 className="font-serif text-4xl sm:text-5xl text-black leading-[1.1]">
              Skillance{' '}
              <span className="italic">by the numbers</span>
            </h2>
          </div>

          <div className="stats-container space-y-12">
            {stats.map((stat, index) => (
              <div key={stat.label} className="flex items-baseline gap-4">
                <span className="font-serif text-5xl sm:text-7xl lg:text-8xl text-black tabular-nums">
                  {formatStat(stat, animatedValues[index] ?? 0)}
                </span>
                <span className="text-neutral-500 text-lg max-w-[220px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;
