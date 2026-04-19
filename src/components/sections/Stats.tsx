import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

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

const defaultStats: Stat[] = [
  { value: 0, suffix: '', label: 'current user count on Skillance' },
  { value: 100, suffix: '%', label: 'of professionals are verified before joining' },
  { value: 1, suffix: 'K+', label: 'successful service bookings completed' },
  { value: 4.8, suffix: '', label: 'average rating from satisfied customers' },
];

const Stats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stat[]>(defaultStats);
  const [animatedValues, setAnimatedValues] = useState<number[]>(defaultStats.map(() => 0));
  const hasAnimated = useRef(false);
  const statsReady = useRef(false);

  useEffect(() => {
    get(ApiPaths.public.stats)
      .then((res) => {
        if (res.success && res.data) {
          const { verifiedPercent, bookingsCount, avgRating } = res.data;
          const bookingsDisplay = bookingsCount >= 1000 ? bookingsCount / 1000 : bookingsCount;
          const bookingsSuffix = bookingsCount >= 1000 ? 'K+' : '+';
          const usersParsed = parseUsersCount(res.data);
          const userCount = usersParsed ?? 0;

          setStats([
            { value: userCount, suffix: '', label: 'current user count on Skillance' },
            { value: verifiedPercent, suffix: '%', label: 'of professionals are verified before joining' },
            { value: bookingsDisplay, suffix: bookingsSuffix, label: 'successful service bookings completed' },
            { value: avgRating, suffix: '', label: 'average rating from satisfied customers' },
          ]);
        }
      })
      .catch(() => {})
      .finally(() => {
        statsReady.current = true;
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.stats-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.stats-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const len = stats.length;
      const anim: Record<string, number> = {};
      for (let i = 0; i < len; i += 1) {
        anim[`v${i}`] = 0;
      }

      ScrollTrigger.create({
        trigger: '.stats-container',
        start: 'top 80%',
        onEnter: () => {
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            const endValues = Object.fromEntries(
              stats.map((s, i) => [`v${i}`, s.value]),
            ) as Record<string, number>;
            gsap.to(anim, {
              duration: 2,
              ease: 'power2.out',
              ...endValues,
              onUpdate: () => {
                setAnimatedValues(
                  stats.map((s, i) =>
                    Number(anim[`v${i}`].toFixed(s.value % 1 === 0 ? 0 : 1)),
                  ),
                );
              },
            });
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [stats]);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left - Header */}
          <div className="stats-header">
            <h2 className="font-serif text-4xl sm:text-5xl text-black leading-[1.1]">
              Skillance{' '}
              <span className="italic">by the numbers</span>
            </h2>
            <p className="text-neutral-500 text-lg mt-4 max-w-md">
              Trusted metrics from our platform
            </p>
          </div>

          {/* Right - Stats */}
          <div className="stats-container space-y-12">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-baseline gap-4">
                <span className="font-serif text-5xl sm:text-7xl lg:text-8xl text-black tabular-nums">
                  {index === 0
                    ? Math.round(animatedValues[index] ?? 0).toLocaleString('en-ZA')
                    : `${animatedValues[index] ?? 0}${stat.suffix}`}
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
};

export default Stats;
