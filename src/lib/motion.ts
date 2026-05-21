/** Shared motion tokens (Emil design-eng aligned). */

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const LENIS_DURATION = 0.85;
export const SECTION_SCROLL_DURATION = 0.85;

export const SCROLL_REVEAL_Y = 24;
export const SCROLL_REVEAL_DURATION = 0.65;
export const SCROLL_REVEAL_EASE = 'power3.out';

export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const scrollRevealFrom = (reduced: boolean) =>
  reduced ? { opacity: 0 } : { opacity: 0, y: SCROLL_REVEAL_Y };

export const scrollRevealTo = (reduced: boolean) =>
  reduced
    ? { opacity: 1, duration: 0.2, ease: 'power2.out' }
    : { opacity: 1, y: 0, duration: SCROLL_REVEAL_DURATION, ease: SCROLL_REVEAL_EASE };

/** ScrollTrigger: play once, no reverse on scroll up. */
export const scrollRevealTrigger = (
  trigger: string | Element | null | undefined,
  start = 'top 85%'
) => ({
  trigger,
  start,
  once: true,
});

import gsap from 'gsap';

/** Standard section scroll reveal (opacity + y, once). */
export function revealFromTo(
  target: gsap.TweenTarget,
  trigger: string | Element | null | undefined,
  reduced: boolean,
  extra?: gsap.TweenVars & { start?: string }
): void {
  const { start, ...rest } = extra ?? {};
  gsap.fromTo(target, scrollRevealFrom(reduced), {
    ...scrollRevealTo(reduced),
    ...rest,
    scrollTrigger: scrollRevealTrigger(trigger, start),
  });
}
