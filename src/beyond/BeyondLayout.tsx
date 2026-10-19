import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/beyond/components/Header';
import StudioFooter from '@/beyond/components/StudioFooter';
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
  useBeyondFonts();

  useEffect(() => {
    document.body.classList.add('by-active');
    return () => document.body.classList.remove('by-active');
  }, []);

  return (
    <div className="by-scope">
      <a className="by-skip" href="#beyond-content">
        Skip to content
      </a>
      <Header />
      <main id="beyond-content" tabIndex={-1} className="by-main">
        <div key={pathname} className="by-page">
          <Outlet />
        </div>
      </main>
      <StudioFooter />
    </div>
  );
}
