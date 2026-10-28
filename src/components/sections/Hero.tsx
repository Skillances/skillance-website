import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InlineWordRotate from '@/components/motion/InlineWordRotate';
import { isTouchPrimary } from '@/lib/motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!reducedMotion && !isTouchPrimary() && imageRef.current) {
        gsap.to(imageRef.current, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: reducedMotion ? 0.2 : 0.7,
            ease: 'power3.out',
            delay: reducedMotion ? 0 : 0.15,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="home" ref={heroRef} className="site-hero w-full">
      <div ref={imageRef} className="site-hero-media">
        <div className="absolute inset-x-0 top-8 h-[calc(100%-2rem)] w-full lg:inset-0 lg:-top-[10%] lg:h-[120%]">
        <picture className="w-full h-full block">
          <source media="(max-width: 1023px)" srcSet="/hero-image-portrait.webp" />
          <img
            src="/hero-image.webp"
            alt="Skillance"
            width={1536}
            height={1024}
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.35) 100%)',
          }}
        />
        </div>
      </div>

      <div ref={textRef} className="site-hero-content px-6">
        <h1 className="font-serif text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.1] max-w-4xl flex flex-col items-center gap-2 sm:gap-3">
          <span>The</span>
          <span className="relative flex items-center justify-center min-w-[11ch] h-[1.2em]">
            <InlineWordRotate
              words={['marketplace', 'platform', 'community', 'network', 'ecosystem']}
              observeRootId="home"
            />
          </span>
          <span className="italic">designed for trust.</span>
        </h1>
      </div>
    </section>
  );
};

export default Hero;
