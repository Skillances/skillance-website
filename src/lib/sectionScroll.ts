/**
 * Section in-page scroll helpers for Lenis + fixed header (launch strip + primary nav).
 */

type LenisLike = {
  scroll: number;
  scrollTo: (
    target: HTMLElement | string | number,
    options?: { offset?: number; duration?: number; immediate?: boolean; force?: boolean }
  ) => void;
};

/** Fallback before layout measures fixed chrome (launch strip + nav). */
export const SECTION_SCROLL_MARGIN_FALLBACK_PX = 120;

export type ScrollToSectionOptions = {
  immediate?: boolean;
  duration?: number;
};

export function getLenisFromWindow(): LenisLike | undefined {
  if (typeof window === 'undefined') return undefined;
  const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
  if (!lenis || typeof lenis.scrollTo !== 'function') return undefined;
  return lenis;
}

export function getViewportScrollY(lenis?: LenisLike): number {
  if (lenis != null && typeof lenis.scroll === 'number' && Number.isFinite(lenis.scroll)) {
    return lenis.scroll;
  }
  return window.scrollY;
}

/** Pixels from viewport top where section content should start (below launch strip + nav). */
export function getSectionScrollTopReservePx(): number {
  const nav = document.getElementById('site-primary-nav');
  if (nav) {
    return Math.ceil(nav.getBoundingClientRect().bottom) + 4;
  }
  return SECTION_SCROLL_MARGIN_FALLBACK_PX;
}

export function syncSectionScrollMarginCss(): void {
  if (typeof document === 'undefined') return;
  const px = getSectionScrollTopReservePx();
  document.documentElement.style.setProperty('--section-scroll-margin', `${px}px`);
}

export function scrollToPageSection(
  element: HTMLElement,
  lenis?: LenisLike,
  options?: ScrollToSectionOptions
): void {
  const reserve = getSectionScrollTopReservePx();
  const immediate = options?.immediate ?? false;
  const duration = options?.duration ?? (immediate ? 0 : 0.85);

  if (lenis) {
    lenis.scrollTo(element, {
      offset: -reserve,
      duration,
      immediate,
      force: true,
    });
    return;
  }

  element.scrollIntoView({
    behavior: immediate ? 'auto' : 'smooth',
    block: 'start',
  });
}

export function computeSectionScrollTop(element: HTMLElement, lenis?: LenisLike): number {
  const rect = element.getBoundingClientRect();
  return Math.max(0, rect.top + getViewportScrollY(lenis));
}
