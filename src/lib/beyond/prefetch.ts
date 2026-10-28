export const BEYOND_FONT_LINK_ID = 'by-fonts';
const BEYOND_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Outfit:wght@400;500;600&display=swap';

/** Injects the Beyond font stylesheet once. Safe to call early so the switch does not wait on fonts. */
export function ensureBeyondFonts() {
  if (document.getElementById(BEYOND_FONT_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = BEYOND_FONT_LINK_ID;
  link.rel = 'stylesheet';
  link.href = BEYOND_FONT_HREF;
  document.head.appendChild(link);
}

let prefetched = false;

/** Warms the lazy Beyond chunk, fonts and hero image so switching experiences does not hit a blank wait. */
export function prefetchBeyond() {
  if (prefetched || typeof window === 'undefined') return;
  prefetched = true;
  void import('@/beyond/BeyondApp');
  ensureBeyondFonts();
  const hero = window.matchMedia('(max-width: 1023px)').matches
    ? '/beyond/new/hero-cinematic-portrait.webp'
    : '/beyond/new/hero-cinematic.webp';
  const img = new Image();
  img.decoding = 'async';
  img.src = hero;
}

/** Prefetch once the page has settled, without competing with first paint. */
export function prefetchBeyondWhenIdle() {
  const run = () => prefetchBeyond();
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run, { timeout: 4000 });
  } else {
    window.setTimeout(run, 2500);
  }
}
