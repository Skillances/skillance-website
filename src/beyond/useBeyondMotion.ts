import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPrefersReducedMotion, revealFromTo } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section reveals and light parallax inside the Beyond layout root.
 */
export function useBeyondMotion(scopeRef: RefObject<HTMLElement | null>, routeKey: string) {
  useEffect(() => {
    const root = scopeRef.current;
    if (!root) return;

    const reducedMotion = getPrefersReducedMotion();
    const ctx = gsap.context(() => {
      const heroStagger = root.querySelector<HTMLElement>('.by-hero-stagger');
      if (heroStagger) {
        const items = Array.from(heroStagger.children) as HTMLElement[];
        if (reducedMotion) {
          gsap.set(items, { opacity: 1 });
        } else {
          gsap.fromTo(
            items,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.72,
              ease: 'power3.out',
              stagger: 0.09,
              delay: 0.12,
            }
          );
        }
      }

      root.querySelectorAll<HTMLElement>('.by-reveal').forEach((el) => {
        revealFromTo(el, el, reducedMotion);
      });

      if (!reducedMotion) {
        root.querySelectorAll<HTMLElement>('.by-parallax').forEach((wrap) => {
          const media = wrap.querySelector<HTMLElement>('.by-parallax-media');
          if (!media) return;
          gsap.to(media, {
            yPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: wrap,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      }
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 360);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [scopeRef, routeKey]);
}
