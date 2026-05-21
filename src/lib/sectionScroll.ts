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

/** Fallback before layout measures fixed chrome (launch strip + nav). */
export const SECTION_SCROLL_MARGIN_FALLBACK_PX = 136;

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
  if (nav) {
    return Math.ceil(nav.getBoundingClientRect().bottom) + 16;
  }
  // Launch strip (h-8) + nav offset (top-8) + approximate nav block height
  return 32 + 72 + 16;
}

/** Keep CSS scroll-margin in sync with measured fixed header height. */
export function syncSectionScrollMarginCss(): void {
  if (typeof document === 'undefined') return;
  const px = getSectionScrollTopReservePx();
  document.documentElement.style.setProperty('--section-scroll-margin', `${px}px`);
}

export function scrollToPageSection(element: HTMLElement, lenis?: LenisLike): void {
  const reserve = getSectionScrollTopReservePx();
  const targetTop = Math.max(0, computeSectionScrollTop(element, lenis) - reserve);

  if (lenis) {
    lenis.scrollTo(element, { offset: -reserve, duration: 1, force: true });
    window.setTimeout(() => {
      const settled = getLenisFromWindow();
      const el = document.getElementById(element.id) ?? element;
      const top = Math.max(0, computeSectionScrollTop(el, settled) - getSectionScrollTopReservePx());
      if (settled) settled.scrollTo(top, { duration: 0.35, force: true });
      else window.scrollTo({ top, behavior: 'auto' });
    }, 520);
    return;
  }

  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

export function computeSectionScrollTop(element: HTMLElement, lenis?: LenisLike): number {
  const rect = element.getBoundingClientRect();
  return Math.max(0, rect.top + getViewportScrollY(lenis));
}
