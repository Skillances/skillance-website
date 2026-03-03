import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 100, suffix: '%', label: 'of professionals are verified before joining' },
  { value: 50, suffix: 'K+', label: 'successful service bookings completed' },
  { value: 4.8, suffix: '', label: 'average rating from satisfied customers' },
];

const Stats = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));
  const hasAnimated = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
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

      // Stats animation - Refactored for better sync and state updates
      const animationObj = { 
        val0: 0, 
        val1: 0, 
        val2: 0 
      };

      ScrollTrigger.create({
        trigger: '.stats-container',
        start: 'top 80%',
        onEnter: () => {
          if (!hasAnimated.current) {
            hasAnimated.current = true;
            gsap.to(animationObj, {
              val0: stats[0].value,
              val1: stats[1].value,
              val2: stats[2].value,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                setAnimatedValues([
                  Number(animationObj.val0.toFixed(stats[0].value % 1 === 0 ? 0 : 1)),
                  Number(animationObj.val1.toFixed(stats[1].value % 1 === 0 ? 0 : 1)),
                  Number(animationObj.val2.toFixed(stats[2].value % 1 === 0 ? 0 : 1)),
                ]);
              }
            });
          }
        },
      });
      
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
              By The Numbers
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-black leading-[1.1]">
              Skillance{' '}
              <span className="italic">by the numbers.</span>
            </h2>
          </div>

          {/* Right - Stats */}
          <div className="stats-container space-y-12">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-baseline gap-4">
                <span className="font-serif text-6xl sm:text-7xl lg:text-8xl text-black tabular-nums">
                  {animatedValues[index]}{stat.suffix}
                </span>
                <span className="text-neutral-500 text-lg max-w-[200px]">
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
