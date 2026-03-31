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
      className="py-32 lg:py-40 bg-white overflow-hidden"
      style={{ scrollMarginTop: '152px' }}
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

            {/* Mission image — visible on desktop below the heading */}
            <div className="scroll-reveal hidden lg:block mt-12 rounded-[2rem] overflow-hidden aspect-[4/3] bg-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=85&w=900&h=675"
                alt="Two professionals collaborating"
                width={900}
                height={675}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8 lg:pt-16">
            <p className="scroll-reveal text-lg text-neutral-600 leading-relaxed uw:text-4xl uw:max-w-3xl">
              The freelance marketplace industry suffers from low trust, inconsistent
              quality, and unsustainable pricing pressure. Businesses struggle to find
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

            {/* Mobile mission image */}
            <div className="scroll-reveal lg:hidden rounded-[2rem] overflow-hidden aspect-[4/3] bg-neutral-100">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=85&w=800&h=600"
                alt="Two professionals collaborating"
                width={800}
                height={600}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
