import { useEffect } from 'react';
import { getSectionScrollTopReservePx, syncSectionScrollMarginCss } from '@/lib/sectionScroll';

/** Keeps --by-site-chrome in sync with Beyond attention strip + header on Beyond routes. */
export function useBeyondSiteChrome() {
  useEffect(() => {
    const sync = () => {
      const banner = document.getElementById('beyond-launch-strip');
      const header = document.querySelector<HTMLElement>('.by-header');
      let px = 0;
      if (banner) px += banner.getBoundingClientRect().height;
      if (header) px += header.getBoundingClientRect().height;
      if (px < 1) px = getSectionScrollTopReservePx();
      document.documentElement.style.setProperty('--by-site-chrome', `${px}px`);
      syncSectionScrollMarginCss();
    };
    sync();
    window.addEventListener('resize', sync);
    const t1 = window.setTimeout(sync, 100);
    const t2 = window.setTimeout(sync, 400);
    return () => {
      window.removeEventListener('resize', sync);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
}
