import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPrefersReducedMotion, isTouchPrimary, revealFromTo, scrollRevealTrigger } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);
// iOS Safari fires resize as the URL bar collapses; refreshing then makes sections jump.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Section reveals and light parallax inside the Beyond layout root.
 */
export function useBeyondMotion(scopeRef: RefObject<HTMLElement | null>, routeKey: string) {
  // Layout effect so reveal start states apply before paint (no flash of unstyled content).
  useLayoutEffect(() => {
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
        if (el.closest('.by-market-editorial')) return;
        revealFromTo(el, el, reducedMotion);
      });

      const marketEditorial = root.querySelector<HTMLElement>('.by-market-editorial');
      if (marketEditorial) {
        const listItems = Array.from(
          marketEditorial.querySelectorAll<HTMLElement>('.by-market-list-item')
        );
        const visual = marketEditorial.querySelector<HTMLElement>('.by-market-editorial-visual');
        const copyHead = marketEditorial.querySelector<HTMLElement>('.by-market-eyebrow');

        if (copyHead) {
          const introCopy = [
            copyHead,
            marketEditorial.querySelector<HTMLElement>('.by-market-title'),
            marketEditorial.querySelector<HTMLElement>('.by-market-subhead'),
          ].filter((el): el is HTMLElement => Boolean(el));
          revealFromTo(introCopy, marketEditorial, reducedMotion, { start: 'top 88%' });
        }

        if (listItems.length) {
          if (reducedMotion) {
            gsap.set(listItems, { opacity: 1, y: 0 });
          } else {
            gsap.fromTo(
              listItems,
              { opacity: 0, y: 18 },
              {
                opacity: 1,
                y: 0,
                duration: 0.58,
                ease: 'power3.out',
                stagger: 0.06,
                scrollTrigger: scrollRevealTrigger(marketEditorial, 'top 85%'),
              }
            );
          }
        }

        if (visual) {
          if (reducedMotion) {
            gsap.set(visual, { opacity: 1, scale: 1 });
          } else {
            gsap.fromTo(
              visual,
              { opacity: 0, scale: 0.98 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.72,
                ease: 'power3.out',
                scrollTrigger: scrollRevealTrigger(marketEditorial, 'top 82%'),
              }
            );
          }
        }
      }

      if (!reducedMotion && !isTouchPrimary()) {
        root.querySelectorAll<HTMLElement>('.by-parallax').forEach((wrap) => {
          const media = wrap.querySelector<HTMLElement>('.by-parallax-media');
          if (!media) return;
          const inProofBand = Boolean(wrap.closest('.by-proof-band'));
          gsap.to(media, {
            yPercent: inProofBand ? 4 : 10,
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
