import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealFromTo } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const trustFeatures: { title: string; description: React.ReactNode }[] = [
  {
    title: 'ID-checked providers',
    description:
      "Before a provider can take bookings, we check their identity document and match it to their profile photo. This confirms who they are. It doesn't assess their skills.",
  },
  {
    title: 'Everything in one place',
    description:
      'Find, compare and book local providers in one app, and keep a record of each booking.',
  },
  {
    title: 'Reviews from customers',
    description: (
      <>
        Customers can rate and review providers after a booking. We moderate reviews under our{' '}
        <Link to="/terms" className="underline underline-offset-4 hover:text-white">
          Terms
        </Link>
        .
      </>
    ),
  },
  {
    title: 'Help when you need it',
    description: (
      <>
        Questions about a booking? Email{' '}
        <a href="mailto:support@skillance.co.za" className="underline underline-offset-4 hover:text-white">
          support@skillance.co.za
        </a>
        . Support hours are Mon-Fri 09:00-17:00.
      </>
    ),
  },
];

const TrustSafety = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealFromTo('.trust-header', '.trust-header', reducedMotion);
      revealFromTo('.trust-card', '.trust-grid', reducedMotion, {
        stagger: 0.06,
        start: 'top 80%',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="trust-safety"
      ref={sectionRef}
      className="py-24 lg:py-32 2xl:py-24 bg-neutral-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="trust-header max-w-3xl mb-20">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
            Trust & Safety
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
            Your security,{' '}
            <span className="italic">our priority.</span>
          </h2>
          <p className="text-lg text-neutral-400 leading-relaxed">
            Here&apos;s exactly what we check, and what we don&apos;t.
          </p>
        </div>

        {/* Features Grid */}
        <div className="trust-grid grid md:grid-cols-2 gap-px bg-neutral-800">
          {trustFeatures.map((feature) => (
            <div
              key={feature.title}
              className="trust-card bg-neutral-900 p-10 lg:p-12"
            >
              <h3 className="font-serif text-2xl text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t border-neutral-800">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-neutral-400">SSL secured site</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-neutral-400">ID-checked providers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSafety;
