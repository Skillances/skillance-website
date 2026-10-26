import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import InlineWordRotate from '@/components/motion/InlineWordRotate';
import { HOME_HERO, HOME_HERO_ROTATE_WORDS } from '@/beyond/content';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

type BeyondHeroProps = {
  titleId: string;
};

export default function BeyondHero({ titleId }: BeyondHeroProps) {
  const shellRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
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
          <source media="(max-width: 1023px)" srcSet="/beyond/new/hero-cinematic-portrait.jpg" />
          <img
            src="/beyond/new/hero-cinematic.jpg"
            alt=""
            width={1920}
            height={1080}
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <div className="by-hero-cinematic-scrim by-hero-cinematic-scrim--b" />
      </div>

      <div className="by-hero-cinematic-copy by-hero-stagger">
        <h1 id={titleId} className="by-hero-cinematic-title">
          <span className="by-hero-title-line">{HOME_HERO.rotatePrefix}</span>
          <span className="by-hero-word-slot">
            <InlineWordRotate
              words={[...HOME_HERO_ROTATE_WORDS]}
              observeRootId="beyond-home-hero"
              className="by-hero-word-rotate"
            />
          </span>
          <span className="by-hero-line by-hero-line-on-dark">{HOME_HERO.rotateSuffix}</span>
        </h1>
        <p className="by-lede by-hero-lede by-lede-on-dark">{HOME_HERO.lede}</p>
        <div className="by-actions by-actions-hero">
          <EnquiryLink ctaLocation="home_hero" variant="light">
            Start a project
          </EnquiryLink>
          <Link to="/beyond/approach" className="by-btn by-btn-on-dark">
            How a project runs
          </Link>
        </div>
      </div>
    </section>
  );
}
