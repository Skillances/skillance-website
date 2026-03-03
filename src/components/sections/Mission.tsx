import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Mission = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = contentRef.current?.querySelectorAll('.scroll-reveal');
      if (elements) {
        elements.forEach((el) => {
          gsap.fromTo(el,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="mission"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 uw:max-w-[120rem] uw:px-20">
        <div ref={contentRef} className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left Content */}
          <div>
            <p className="scroll-reveal text-sm uppercase tracking-widest text-neutral-500 mb-6 uw:text-xl uw:mb-12">
              Our Mission
            </p>
            <h2 className="scroll-reveal font-serif text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1] uw:text-[10rem]">
              Quality connections,{' '}
              <span className="italic">lasting results.</span>
            </h2>
          </div>

          {/* Right Content */}
          <div className="space-y-8 lg:pt-16">
            <p className="scroll-reveal text-lg text-neutral-600 leading-relaxed uw:text-4xl uw:max-w-3xl">
              The freelance marketplace industry suffers from low trust, inconsistent 
              quality, and race-to-the-bottom pricing. Businesses struggle to find 
              reliable partners. Professionals struggle to build stable income.
            </p>
            <p className="scroll-reveal text-lg text-neutral-600 leading-relaxed uw:text-4xl uw:max-w-3xl">
              Skillance was built on the belief that anyone looking for quality 
              services should be able to find them. We verify every professional 
              on our platform, so you can hire with confidence.
            </p>
            <button 
              onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="scroll-reveal inline-flex items-center gap-2 text-sm font-medium text-black hover:text-neutral-600 transition-colors group uw:text-2xl uw:gap-6"
            >
              See how it works
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform uw:w-8 uw:h-8" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
