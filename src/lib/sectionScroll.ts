/**
 * Section in-page scroll helpers for Lenis + fixed header (launch strip + primary nav).
 * Lenis computes element targets as rect.top + animatedScroll; using window.scrollY can
 * diverge and under-scroll by roughly a viewport.
 */

type LenisLike = {
  scroll: number;
  scrollTo: (
    target: HTMLElement | string | number,
    options?: { offset?: number; duration?: number; immediate?: boolean; force?: boolean }
  ) => void;
};

export function getLenisFromWindow(): LenisLike | undefined {
  if (typeof window === 'undefined') return undefined;
  const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
  if (!lenis || typeof lenis.scrollTo !== 'function') return undefined;
  return lenis;
}

/** Use Lenis scroll position when present so geometry matches lenis.scrollTo. */
export function getViewportScrollY(lenis?: LenisLike): number {
  if (lenis != null && typeof lenis.scroll === 'number' && Number.isFinite(lenis.scroll)) {
    return lenis.scroll;
  }
  return window.scrollY;
}

/** Distance from viewport top to where anchored sections should align (below fixed UI). */
export function getSectionScrollTopReservePx(): number {
  const nav = document.getElementById('site-primary-nav');
  const bottom = nav ? nav.getBoundingClientRect().bottom : 104;
  return Math.ceil(bottom) + 12;
}

export function scrollToPageSection(element: HTMLElement, lenis?: LenisLike): void {
  if (lenis) {
    lenis.scrollTo(element, { offset: 0, duration: 1, force: true });
    return;
  }
  const rect = element.getBoundingClientRect();
  const top = Math.max(0, rect.top + window.scrollY);
  window.scrollTo({ top, behavior: 'smooth' });
}

export function computeSectionScrollTop(element: HTMLElement, lenis?: LenisLike): number {
  const rect = element.getBoundingClientRect();
  return Math.max(0, rect.top + getViewportScrollY(lenis));
}
