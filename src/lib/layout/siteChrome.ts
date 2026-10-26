/** Shared marketing + Beyond header metrics (launch strip + primary nav + switcher dock). */

/** Warm paper shell — loader, App shell, and Beyond scope. */
export const SITE_EXPERIENCE_PAPER = '#f3eee6';

export const SITE_LAUNCH_STRIP_HEIGHT_PX = 32;
export const SITE_PRIMARY_NAV_HEIGHT_PX = 76;
/** Pill row under the marketing nav (matches .experience-switch min-height). */
export const SITE_EXPERIENCE_SWITCHER_HEIGHT_PX = 28;
const SWITCHER_GAP_BELOW_NAV_PX = 4;
const HERO_CLEARANCE_BELOW_SWITCHER_PX = 28;

export function syncSiteChromeCss(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--site-launch-strip-height', `${SITE_LAUNCH_STRIP_HEIGHT_PX}px`);
  root.style.setProperty('--site-primary-nav-top', `${SITE_LAUNCH_STRIP_HEIGHT_PX}px`);
  root.style.setProperty('--site-primary-nav-height', `${SITE_PRIMARY_NAV_HEIGHT_PX}px`);

  const chromeBottom =
    SITE_LAUNCH_STRIP_HEIGHT_PX + SITE_PRIMARY_NAV_HEIGHT_PX;
  const switcherTop = chromeBottom + SWITCHER_GAP_BELOW_NAV_PX;
  const switcherBottom = switcherTop + SITE_EXPERIENCE_SWITCHER_HEIGHT_PX;

  root.style.setProperty('--experience-switch-dock-top', `${switcherTop}px`);
  root.style.setProperty(
    '--site-marketing-hero-safe-top',
    `${switcherBottom + HERO_CLEARANCE_BELOW_SWITCHER_PX}px`,
  );
}
