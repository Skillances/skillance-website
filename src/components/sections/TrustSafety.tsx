import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const trustFeatures = [
  {
    title: 'Verified Identities',
    description: 'Every professional passes background checks and identity verification before joining our platform.',
  },
  {
    title: 'Secure Payments',
    description: 'Protected transactions with encrypted processing. Your financial information is always safe.',
  },
  {
    title: 'Insurance Coverage',
    description: 'Eligible services include coverage for peace of mind. We stand behind every booking.',
  },
  {
    title: '24/7 Support',
    description: 'Real humans, always available. Our support team is here to help whenever you need it.',
  },
];

const TrustSafety = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.trust-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.trust-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards animation
      gsap.fromTo('.trust-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.trust-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
            We take your safety seriously. Every professional on our platform 
            goes through rigorous verification.
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
              <span className="text-sm text-neutral-400">SSL Secured</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-neutral-400">Data Protected</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-neutral-400">Verified Professionals</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSafety;
