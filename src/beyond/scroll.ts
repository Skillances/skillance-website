import { getPrefersReducedMotion, SECTION_SCROLL_DURATION } from '@/lib/motion';
import { getLenisFromWindow } from '@/lib/sectionScroll';

export function getBeyondScrollReservePx(): number {
  const header = document.querySelector<HTMLElement>('.by-header');
  if (header) {
    return Math.ceil(header.getBoundingClientRect().height) + 12;
  }
  return 88;
}

export function scrollToBeyondSection(element: HTMLElement, immediate = false): void {
  const lenis = getLenisFromWindow();
  const reserve = getBeyondScrollReservePx();
  const duration = immediate || getPrefersReducedMotion() ? 0 : SECTION_SCROLL_DURATION;

  if (lenis) {
    lenis.scrollTo(element, {
      offset: -reserve,
      duration,
      immediate,
      force: true,
    });
    return;
  }

  const top = element.getBoundingClientRect().top + window.scrollY - reserve;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: immediate ? 'auto' : 'smooth',
  });
}

export function scrollToBeyondHash(hash: string): void {
  const id = hash.replace(/^#/, '');
  if (!id) return;

  let tries = 0;
  const run = () => {
    const el = document.getElementById(id);
    if (!el && tries < 12) {
      tries += 1;
      window.requestAnimationFrame(run);
      return;
    }
    if (el) scrollToBeyondSection(el);
  };
  run();
}
