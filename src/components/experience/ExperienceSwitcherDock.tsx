import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ExperienceSwitcher from '@/components/experience/ExperienceSwitcher';
import { isBeyondPath } from '@/lib/beyond/routes';
import { isMarketingAuthPath } from '@/lib/marketing/authPaths';
import { syncSiteChromeCss } from '@/lib/layout/siteChrome';
import { siteNavDesktopMediaQuery } from '@/lib/layout/siteNavBreakpoint';

type Appearance = 'quiet-dark' | 'quiet-light';

function readAppearance(pathname: string): Appearance {
  if (isBeyondPath(pathname)) {
    return document.querySelector('.by-header-on-cinematic') ? 'quiet-dark' : 'quiet-light';
  }
  const nav = document.getElementById('site-primary-nav');
  if (nav?.dataset.navTone === 'dark') return 'quiet-dark';
  return 'quiet-light';
}

/**
 * Fixed-position experience switcher so Marketplace / Beyond links stay pixel-stable across routes.
 */
export default function ExperienceSwitcherDock({ enabled }: { enabled: boolean }) {
  const { pathname } = useLocation();
  const [appearance, setAppearance] = useState<Appearance>(() => readAppearance(pathname));
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(siteNavDesktopMediaQuery);
    const onMq = () => setDesktop(mq.matches);
    onMq();
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      syncSiteChromeCss();
      setAppearance(readAppearance(pathname));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const id = window.requestAnimationFrame(update);

    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [enabled, pathname]);

  if (!enabled || !desktop || isMarketingAuthPath(pathname)) {
    return null;
  }

  return (
    <div className="experience-switch-dock" aria-hidden={false}>
      <ExperienceSwitcher appearance={appearance} />
    </div>
  );
}
