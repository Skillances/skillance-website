import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { NAV } from '@/beyond/content';
import { getBeyondScrollReservePx, scrollToBeyondHash } from '@/beyond/scroll';
import { isBeyondNavCurrent } from '@/lib/beyond/nav';
import { landingPath } from '@/lib/marketplace/session';
import { useAuth } from '@/context/AuthContext';
import ExperienceSwitcher from '@/components/experience/ExperienceSwitcher';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { siteNavDesktopMediaQuery } from '@/lib/layout/siteNavBreakpoint';
import { MOBILE_NAV_PANEL_CLASS } from '@/lib/layout/mobileNavPanelClass';
import { useMobileMenuLock } from '@/lib/layout/useMobileMenuLock';

export default function Header() {
  const { pathname, hash } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navPath, setNavPath] = useState(pathname);
  const [onCinematicHero, setOnCinematicHero] = useState(false);

  if (pathname !== navPath) {
    setNavPath(pathname);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const menuId = useId();
  const { isAuthenticated, isAdmin, isLoading: authLoading, user } = useAuth();

  const sessionLink = authLoading
    ? null
    : isAuthenticated && isAdmin
      ? { to: '/admin/dashboard', label: 'Admin', aria: 'Admin dashboard' }
      : isAuthenticated && user
        ? { to: landingPath(user), label: 'Account', aria: 'Your Skillance account' }
        : { to: '/login', label: 'Sign in', aria: 'Sign in' };

  const closeMenu = () => {
    restoreFocus.current = true;
    setMobileOpen(false);
  };

  const toggleMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!hash) return;
    return scrollToBeyondHash(hash);
  }, [pathname, hash]);

  useMobileMenuLock(mobileOpen);

  useEffect(() => {
    if (!mobileOpen) {
      if (restoreFocus.current) {
        menuBtnRef.current?.focus({ preventScroll: true });
        restoreFocus.current = false;
      }
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia(siteNavDesktopMediaQuery);
    const onChange = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const hero = document.querySelector('.by-hero-cinematic');
    if (!hero) {
      requestAnimationFrame(() => setOnCinematicHero(false));
      return;
    }

    const update = () => {
      const reserve = getBeyondScrollReservePx();
      const rect = hero.getBoundingClientRect();
      setOnCinematicHero(rect.bottom > reserve + 8);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  const headerClass = onCinematicHero ? 'by-header by-header-on-cinematic' : 'by-header';
  const toggleStroke = mobileOpen ? '#1a1714' : onCinematicHero ? '#fffdf8' : '#1a1714';
  const switchAppearance = onCinematicHero ? 'quiet-dark' : 'quiet-light';
  const navPrimary = NAV.slice(0, 3);
  const navSecondary = NAV.slice(3);

  const mobileLinkClass =
    'block touch-manipulation text-lg font-medium text-neutral-800 hover:text-black active:text-neutral-500 motion-ui motion-press transition-colors py-4 border-b border-neutral-100';

  const mobileMenu =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {mobileOpen ? (
              <motion.div
                className="by-beyond-mobile-nav fixed inset-0 z-[110]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.div
                  className="absolute inset-0 bg-black/45 cursor-pointer touch-none"
                  role="presentation"
                  onClick={closeMenu}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <motion.div
                  id={menuId}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Beyond the App menu"
                  className={MOBILE_NAV_PANEL_CLASS}
                  data-lenis-prevent
                  initial={{ transform: 'translateX(100%)' }}
                  animate={{ transform: 'translateX(0)' }}
                  exit={{ transform: 'translateX(100%)' }}
                  transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                >
                  <div className="flex items-center justify-between px-6 py-[22px] border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <img
                        src="/skillance-tiny-logo-black.png"
                        alt="Skillance"
                        width={120}
                        height={24}
                        className="h-6 w-auto"
                      />
                      <span className="font-serif text-2xl font-medium">Skillance</span>
                    </div>
                    <button type="button" className="p-2 -mr-2 touch-manipulation" onClick={closeMenu} aria-label="Close menu">
                      <X className="w-8 h-8 text-black" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="p-6">
                    <ExperienceSwitcher appearance="quiet-light" density="comfortable" />
                    <nav className="flex flex-col gap-1 mt-6" aria-label="Beyond the App">
                      {NAV.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={mobileLinkClass}
                          onClick={closeMenu}
                          aria-current={
                            isBeyondNavCurrent(pathname, item.to, item.end) ? 'page' : undefined
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
                      {sessionLink ? (
                        <Link
                          to={sessionLink.to}
                          className={mobileLinkClass}
                          onClick={closeMenu}
                          aria-label={sessionLink.aria}
                        >
                          {sessionLink.label}
                        </Link>
                      ) : null}
                    </nav>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  const renderNavLink = (item: (typeof NAV)[number]) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className="by-nav-link"
    >
      {item.label}
    </NavLink>
  );

  return (
    <header className={headerClass}>
      <div className="by-header-wrap by-header-inner">
        <nav className="by-nav by-nav-left" aria-label="Beyond the App">
          {navPrimary.map(renderNavLink)}
        </nav>

        <div className="by-header-center">
          <Link to="/beyond" className="by-brand" aria-label="Skillance Beyond the App, overview">
            <img src="/skillance-tiny-logo-black.png" alt="" width={120} height={24} />
            <span className="by-brand-name">Skillance</span>
            <span className="by-brand-rule" aria-hidden="true" />
            <span className="by-brand-beyond">Beyond</span>
          </Link>
          <div className="by-switch-anchor by-switch-anchor-desktop">
            <ExperienceSwitcher appearance={switchAppearance} />
          </div>
        </div>

        <div className="by-header-right">
          <nav className="by-nav by-nav-right" aria-label="Beyond the App">
            {navSecondary.map(renderNavLink)}
          </nav>
          {sessionLink ? (
            <Link to={sessionLink.to} className="by-nav-link by-header-session" aria-label={sessionLink.aria}>
              {sessionLink.label}
            </Link>
          ) : null}
          <button
            type="button"
            className="by-menu-toggle"
            ref={menuBtnRef}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleMenu}
          >
            <MenuToggleIcon open={mobileOpen} className="by-menu-toggle-icon" duration={500} stroke={toggleStroke} />
          </button>
        </div>
      </div>
      {mobileMenu}
    </header>
  );
}
