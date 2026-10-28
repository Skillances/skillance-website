import { getPrefersReducedMotion, SECTION_SCROLL_DURATION } from '@/lib/motion';
import { scrollToPageSection, scrollToSectionId, getLenisFromWindow } from '@/lib/sectionScroll';

export function getBeyondScrollReservePx(): number {
  const chrome = document.querySelector<HTMLElement>('.by-site-chrome');
  if (chrome) return Math.ceil(chrome.getBoundingClientRect().height) + 12;

  const banner = document.getElementById('beyond-attention-banner');
  const launchStrip = document.getElementById('beyond-launch-strip');
  const header = document.querySelector<HTMLElement>('.by-header');
  let px = 12;
  if (banner) px += banner.getBoundingClientRect().height;
  if (launchStrip) px += launchStrip.getBoundingClientRect().height;
  if (header) px += header.getBoundingClientRect().height;
  if (banner || launchStrip || header) return Math.ceil(px);
  return 88;
}

export function scrollToBeyondSection(element: HTMLElement, immediate = false): void {
  scrollToPageSection(element, getLenisFromWindow(), {
    reserve: getBeyondScrollReservePx(),
    immediate: immediate || getPrefersReducedMotion(),
    duration: SECTION_SCROLL_DURATION,
  });
}

export function scrollToBeyondHash(hash: string): () => void {
  const id = hash.replace(/^#/, '');
  if (!id) return () => {};
  return scrollToSectionId(id, {
    reserve: getBeyondScrollReservePx,
    immediate: getPrefersReducedMotion(),
    duration: SECTION_SCROLL_DURATION,
  });
}
