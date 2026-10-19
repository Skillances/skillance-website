import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import InlineWordRotate from '@/components/motion/InlineWordRotate';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const HERO_ROTATE_WORDS = ['SaaS products', 'mobile apps', 'cloud systems', 'integrations'];

type BeyondHeroProps = {
  titleId: string;
};

export default function BeyondHero({ titleId }: BeyondHeroProps) {
  const shellRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!reducedMotion && mediaRef.current) {
        gsap.to(mediaRef.current, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: shellRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (copyRef.current) {
        gsap.fromTo(
          copyRef.current,
          reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: reducedMotion ? 0.2 : 0.7,
            ease: 'power3.out',
            delay: reducedMotion ? 0 : 0.15,
          },
        );
      }
    }, shellRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={shellRef}
      id="beyond-home-hero"
      className="by-hero-cinematic"
      aria-labelledby={titleId}
    >
      <div ref={mediaRef} className="by-hero-cinematic-media" aria-hidden="true">
        <picture className="by-hero-cinematic-picture">
          <source media="(max-width: 1023px)" srcSet="/beyond/hero-cinematic-portrait.jpg" />
          <img
            src="/beyond/hero-cinematic.jpg"
            alt=""
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="by-hero-cinematic-scrim" />
      </div>

      <div ref={copyRef} className="by-hero-cinematic-copy by-hero-stagger">
        <h1 id={titleId} className="by-hero-cinematic-title">
          <span className="by-hero-title-line">We build</span>
          <span className="by-hero-word-slot">
            <InlineWordRotate
              words={HERO_ROTATE_WORDS}
              observeRootId="beyond-home-hero"
              className="by-hero-word-rotate"
            />
          </span>
          <span className="by-hero-line by-hero-line-on-dark">you can run.</span>
        </h1>
        <p className="by-lede by-hero-lede by-lede-on-dark">
          Custom software from the team behind the Skillance marketplace.
        </p>
        <div className="by-actions by-actions-hero">
          <EnquiryLink ctaLocation="home_hero">Email a project enquiry</EnquiryLink>
          <Link to="/beyond/approach" className="by-btn by-btn-on-dark">
            How we work
          </Link>
        </div>
      </div>
    </section>
  );
}
