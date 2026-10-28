/**
 * Section in-page scroll helpers for Lenis + fixed header (launch strip + primary nav).
 */

type LenisLike = {
  scroll: number;
  scrollTo: (
    target: HTMLElement | string | number,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      force?: boolean;
      onComplete?: () => void;
    }
  ) => void;
  on?: (event: 'scroll', callback: () => void) => void;
  off?: (event: 'scroll', callback: () => void) => void;
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

/**
 * Scrolls `element` to just below the fixed chrome. Late layout shifts (images, ScrollTrigger
 * refresh) can move the target while the tween runs, so once it settles the position is
 * re-checked and corrected with one instant jump.
 */
export function scrollToElement(
  element: HTMLElement,
  lenis: LenisLike | undefined,
  { reserve, immediate = false, duration = 0.85 }: { reserve: number; immediate?: boolean; duration?: number }
): void {
  const targetY = () => Math.max(0, element.getBoundingClientRect().top + getViewportScrollY(lenis) - reserve);
  const settle = () => {
    const drift = targetY() - getViewportScrollY(lenis);
    if (Math.abs(drift) <= 2) return;
    if (lenis) lenis.scrollTo(targetY(), { immediate: true, force: true });
    else window.scrollTo({ top: targetY(), behavior: 'auto' });
  };

  if (lenis) {
    lenis.scrollTo(element, {
      offset: -reserve,
      duration: immediate ? 0 : duration,
      immediate,
      force: true,
      onComplete: settle,
    });
    return;
  }

  window.scrollTo({ top: targetY(), behavior: immediate ? 'auto' : 'smooth' });
  if (!immediate) window.setTimeout(settle, 700);
}

export function scrollToPageSection(
  element: HTMLElement,
  lenis?: LenisLike,
  options?: ScrollToSectionOptions & { reserve?: number }
): void {
  scrollToElement(element, lenis, {
    reserve: options?.reserve ?? getSectionScrollTopReservePx(),
    immediate: options?.immediate,
    duration: options?.duration,
  });
}

/**
 * Scrolls to a section by id once it exists. Waits (bounded) for lazy sections to mount and
 * for Lenis to be ready, then falls back to native scrolling. Returns a cancel function.
 */
export function scrollToSectionId(
  id: string,
  options?: ScrollToSectionOptions & { reserve?: () => number; delayMs?: number }
): () => void {
  let cancelled = false;
  let timer = 0;
  let attempts = 0;

  const run = () => {
    if (cancelled) return;
    attempts += 1;
    const element = document.getElementById(id);
    const lenis = getLenisFromWindow();
    if (!element || (!lenis && attempts < 12)) {
      if (attempts < 30) timer = window.setTimeout(run, 60);
      return;
    }
    scrollToPageSection(element, lenis, {
      immediate: options?.immediate,
      duration: options?.duration,
      reserve: options?.reserve?.(),
    });
  };

  timer = window.setTimeout(run, options?.delayMs ?? 0);
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}

export function computeSectionScrollTop(element: HTMLElement, lenis?: LenisLike): number {
  const rect = element.getBoundingClientRect();
  return Math.max(0, rect.top + getViewportScrollY(lenis));
}
