import { useEffect } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPrefersReducedMotion, LENIS_DURATION } from '@/lib/motion';

/**
 * Smooth scroll for /beyond only. The marketing shell disables global Lenis on these routes.
 */
export function useBeyondScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const reducedMotion = getPrefersReducedMotion();
    const lenis = new Lenis({
      duration: reducedMotion ? 0 : LENIS_DURATION,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: false,
      allowNestedScroll: true,
    });

    type LenisWindow = Window & { __lenis?: typeof lenis };
    (window as LenisWindow).__lenis = lenis;

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const refresh = () => ScrollTrigger.refresh();
    const refreshTimeout = window.setTimeout(refresh, 320);
    window.addEventListener('resize', refresh);

    return () => {
      window.clearTimeout(refreshTimeout);
      window.removeEventListener('resize', refresh);
      cancelAnimationFrame(rafId);
      delete (window as LenisWindow).__lenis;
      lenis.destroy();
    };
  }, [active]);
}
