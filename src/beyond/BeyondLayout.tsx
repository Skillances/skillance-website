import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BeyondLaunchStrip from '@/beyond/components/BeyondLaunchStrip';
import Header from '@/beyond/components/Header';
import StudioFooter from '@/beyond/components/StudioFooter';
import { Toaster } from '@/components/ui/sonner';
import { useBeyondMotion } from '@/beyond/useBeyondMotion';
import { useBeyondScroll } from '@/beyond/useBeyondScroll';
import { useBeyondSiteChrome } from '@/beyond/useBeyondSiteChrome';
import '@/beyond/beyond.css';

const FONT_LINK_ID = 'by-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Outfit:wght@400;500;600&display=swap';

function useBeyondFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}

export default function BeyondLayout() {
  const { pathname } = useLocation();
  const scopeRef = useRef<HTMLDivElement>(null);
  useBeyondFonts();
  useBeyondSiteChrome();
  useBeyondScroll(true);
  useBeyondMotion(scopeRef, pathname);

  useEffect(() => {
    document.body.classList.add('by-active');
    return () => document.body.classList.remove('by-active');
  }, []);

  return (
    <div className="by-scope" ref={scopeRef}>
      <div className="by-site-chrome">
        <BeyondLaunchStrip />
        <Header />
      </div>
      <a className="by-skip" href="#beyond-content">
        Skip to content
      </a>
      <main id="beyond-content" tabIndex={-1} className="by-main">
        <div key={pathname} className="by-page">
          <Outlet />
        </div>
      </main>
      <StudioFooter />
      <Toaster position="bottom-center" richColors closeButton />
    </div>
  );
}
