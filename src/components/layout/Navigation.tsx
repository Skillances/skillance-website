import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuToggleIcon } from '../ui/menu-toggle-icon';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getLenisFromWindow, getSectionScrollTopReservePx, scrollToSectionId } from '@/lib/sectionScroll';
import { SHOW_PUBLIC_WEBSITE_REVIEWS } from '@/lib/featureFlags';
import { useAuth } from '@/context/AuthContext';
import { landingPath } from '@/lib/marketplace/session';
import ExperienceSwitcher from '@/components/experience/ExperienceSwitcher';
import { BEYOND_PRIMARY_NAV, isBeyondNavCurrent } from '@/lib/beyond/nav';
import { isBeyondPath } from '@/lib/beyond/routes';
import { isMarketingAuthPath } from '@/lib/marketing/authPaths';
import { MOBILE_NAV_PANEL_CLASS } from '@/lib/layout/mobileNavPanelClass';
import { useMobileMenuLock } from '@/lib/layout/useMobileMenuLock';

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useMobileMenuLock(isMobileMenuOpen);
  const [isDarkSection, setIsDarkSection] = useState(true); // Start with dark (hero)
  const [isPastHero, setIsPastHero] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading, user } = useAuth();
  // Admin keeps its link; other signed-in users get Account; signed-out visitors get Sign in.
  const sessionLink = authLoading
    ? null
    : isAuthenticated && isAdmin
      ? { to: '/admin/dashboard', label: 'Admin', aria: 'Admin dashboard' }
      : isAuthenticated && user
        ? { to: landingPath(user), label: 'Account', aria: 'Your Skillance account' }
        : { to: '/login', label: 'Sign in', aria: 'Sign in' };

  useEffect(() => {
    const handleScroll = () => {
      const lenis = getLenisFromWindow();
      const scrollY = lenis?.scroll ?? window.scrollY;
      
      if (isMarketingAuthPath(location.pathname)) {
        setIsDarkSection(false);
        setIsPastHero(true);
        return;
      }

      if (isBeyondPath(location.pathname)) {
        const heroEl = document.querySelector('.by-hero-cinematic');
        const reservedTopLine = getSectionScrollTopReservePx();

        if (!heroEl) {
          setIsDarkSection(false);
          setIsPastHero(true);
          return;
        }

        const rect = heroEl.getBoundingClientRect();
        const heroStillBehindNav = rect.bottom > reservedTopLine;
        setIsPastHero(!heroStillBehindNav);

        if (heroStillBehindNav) {
          setIsDarkSection(true);
          return;
        }

        const darkBand = document.querySelector('.by-section-invert, .by-section-cta');
        let onDarkBand = false;
        if (darkBand) {
          const bandRect = darkBand.getBoundingClientRect();
          onDarkBand = bandRect.top <= reservedTopLine + 8 && bandRect.bottom > reservedTopLine + 48;
        }
        setIsDarkSection(onDarkBand);
        return;
      }

      if (location.pathname !== '/') {
        // Handle specific dark pages
        const darkPages = ['/faq', '/trust-safety'];
        const isDarkPage = darkPages.includes(location.pathname);
        setIsDarkSection(isDarkPage);
        setIsPastHero(scrollY > 50);
        return;
      }

      // Detect which section is in view and set appropriate color
      const sections = [
        { id: 'home', dark: true },
        { id: 'mission', dark: false },
        { id: 'services', dark: false },
        { id: 'how-it-works', dark: false },
        { id: 'trust-safety', dark: true },
        { id: 'stats', dark: false },
        { id: 'testimonials', dark: true },
        { id: 'faq', dark: true },
        { id: 'reviews', dark: false },
        { id: 'cta', dark: false },
        { id: 'footer', dark: true },
      ];

      // Detect if we're near the bottom of the page
      const isAtBottom = window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50;
      
      if (isAtBottom) {
        setIsDarkSection(true); // Footer is dark
      } else {
        const scrollThreshold = scrollY + 60;
        
        const heroEl = document.getElementById('home');
        if (heroEl) {
          const rect = heroEl.getBoundingClientRect();
          const reservedTopLine = getSectionScrollTopReservePx();
          setIsPastHero(rect.bottom <= reservedTopLine);
        }
        
        for (const section of sections) {
          const el = document.getElementById(section.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            if (scrollThreshold >= sectionTop && scrollThreshold < sectionBottom) {
              setIsDarkSection(section.dark);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const attachLenisScroll = () => {
      const activeLenis = getLenisFromWindow();
      activeLenis?.on?.('scroll', handleScroll);
      return activeLenis;
    };

    let boundLenis = attachLenisScroll();

    const lenisPoll = window.setInterval(() => {
      const activeLenis = getLenisFromWindow();
      if (activeLenis && activeLenis !== boundLenis) {
        boundLenis = attachLenisScroll();
        window.clearInterval(lenisPoll);
      }
    }, 80);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      getLenisFromWindow()?.off?.('scroll', handleScroll);
      window.clearInterval(lenisPoll);
    };
  }, [location.pathname]);

  const onBeyond = isBeyondPath(location.pathname);

  const marketplaceNavLinks = [
    { name: 'Mission', href: '/#mission' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Services', href: '/#services' },
    ...(SHOW_PUBLIC_WEBSITE_REVIEWS ? [{ name: 'Reviews', href: '/#reviews' }] : []),
    { name: 'Contact', href: '/contact' },
    { name: 'Trust', href: '/#trust-safety' },
  ];

  const navLinks = onBeyond ? [...BEYOND_PRIMARY_NAV] : marketplaceNavLinks;

  const scrollToSection = (sectionId: string) => {
    scrollToSectionId(sectionId);
  };

  const handleLinkClick = (href: string, event?: React.MouseEvent) => {
    if (event) event.preventDefault();
    setIsMobileMenuOpen(false);

    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      if (location.pathname === '/') {
        scrollToSection(sectionId);
      } else {
        // Cross-route section navigation: use hash so route intent survives transitions.
        navigate(href);
      }
    }
  };

  // Determine text and button colors based on section
  const textColor = isDarkSection ? 'text-white' : 'text-black';
  const textColorMuted = isDarkSection ? 'text-white/70' : 'text-neutral-600';
  const hoverColor = isDarkSection ? 'hover:text-white' : 'hover:text-black';
  const underlineColor = isDarkSection ? 'bg-white' : 'bg-black';
  const onFullBleedHero =
    (location.pathname === '/' && !isPastHero) ||
    (onBeyond && !isPastHero && isDarkSection);

  const navItemClass = `text-sm font-medium motion-ui motion-press transition-colors relative group ${textColorMuted} ${hoverColor}`;

  const renderDesktopNavItem = (link: (typeof navLinks)[number]) => {
    if (onBeyond && 'end' in link) {
      const current = isBeyondNavCurrent(location.pathname, link.href, link.end);
      return (
        <Link
          key={link.name}
          to={link.href}
          aria-current={current ? 'page' : undefined}
          className={navItemClass}
        >
          {link.name}
          <span
            className={`absolute -bottom-1 left-0 h-px transition-[width] duration-200 ease-out ${
              current ? 'w-full' : 'w-0 group-hover:w-full'
            } ${underlineColor}`}
          />
        </Link>
      );
    }

    return (
      <button
        key={link.name}
        onClick={(e) => link.href.startsWith('/#') ? handleLinkClick(link.href, e) : navigate(link.href)}
        className={navItemClass}
      >
        {link.name}
        <span className={`absolute -bottom-1 left-0 w-0 h-px transition-[width] duration-200 ease-out group-hover:w-full ${underlineColor}`} />
      </button>
    );
  };

  return (
    <>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="nav-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      <nav
        id="site-primary-nav"
        data-nav-tone={isDarkSection ? 'dark' : 'light'}
        className="fixed top-8 left-0 right-0 z-50 flex h-[var(--site-primary-nav-height,4.75rem)] items-center transition-[background-color,border-color,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          backgroundColor: onFullBleedHero
            ? 'transparent'
            : isDarkSection
              ? 'rgba(0,0,0,0.4)'
              : 'rgba(255,255,255,0.85)',
          backdropFilter: onFullBleedHero ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: onFullBleedHero ? 'none' : 'blur(20px)',
          borderBottom: onFullBleedHero
            ? 'none'
            : isDarkSection
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.05)',
        }}
      >
        {!onFullBleedHero && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out"
            style={{
              filter: 'url(#nav-grain)',
              opacity: 0.04,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        <div className="site-primary-nav-inner mx-auto w-full max-w-[1600px] px-6 lg:px-10 xl:px-14">
          <div className="hidden lg:grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-10 xl:gap-x-14">
            <div className="flex min-w-0 items-center justify-start gap-8 xl:gap-10">
              {navLinks.slice(0, 3).map((link) => renderDesktopNavItem(link))}
            </div>

            <div className="relative justify-self-center shrink-0">
              <Link
                to={onBeyond ? '/beyond' : '/'}
                className={`flex items-center gap-3 font-serif text-2xl font-medium tracking-tight motion-ui transition-colors ${textColor}`}
              >
                {isDarkSection ? (
                  <picture>
                    <source type="image/webp" srcSet="/skillance-tiny-logo-white.webp" />
                    <img
                      src="/skillance-tiny-logo-white.png"
                      alt="Skillance"
                      width={120}
                      height={24}
                      className="h-6 w-auto transition-opacity duration-300"
                    />
                  </picture>
                ) : (
                  <img
                    src="/skillance-tiny-logo-black.png"
                    alt="Skillance"
                    width={120}
                    height={24}
                    className="h-6 w-auto transition-opacity duration-300"
                  />
                )}
                Skillance
              </Link>
              <div className="experience-switch-anchor" aria-hidden="true" />
            </div>

            <div className="flex min-w-0 items-center justify-end gap-6 xl:gap-8">
              {navLinks.slice(3).map((link) => renderDesktopNavItem(link))}
              {sessionLink && (
                <Link
                  to={sessionLink.to}
                  className={`text-sm font-medium transition-colors duration-300 relative group ${textColorMuted} ${hoverColor}`}
                  aria-label={sessionLink.aria}
                >
                  {sessionLink.label}
                  <span className={`absolute -bottom-1 left-0 w-0 h-px transition-[width] duration-200 ease-out group-hover:w-full ${underlineColor}`} />
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between lg:hidden">
            <Link
              to={onBeyond ? '/beyond' : '/'}
              className={`flex items-center gap-3 font-serif text-2xl font-medium tracking-tight motion-ui transition-colors ${textColor}`}
            >
              {isDarkSection ? (
                <img
                  src="/skillance-tiny-logo-white.png"
                  alt="Skillance"
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              ) : (
                <img
                  src="/skillance-tiny-logo-black.png"
                  alt="Skillance"
                  width={120}
                  height={24}
                  className="h-6 w-auto"
                />
              )}
              Skillance
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 transition-colors relative z-50 touch-manipulation ${isDarkSection ? 'text-white' : 'text-black'}`}
              aria-label="Toggle menu"
            >
              <MenuToggleIcon
                open={isMobileMenuOpen}
                className="w-8 h-8"
                duration={500}
                stroke={isMobileMenuOpen ? 'black' : isDarkSection ? 'white' : 'black'}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[110] lg:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/45 cursor-pointer touch-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className={MOBILE_NAV_PANEL_CLASS}
              data-lenis-prevent
              initial={{ transform: 'translateX(100%)' }}
              animate={{ transform: 'translateX(0)' }}
              exit={{ transform: 'translateX(100%)' }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              {/* Mobile Header */}
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
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8 text-black" />
                </button>
              </div>

              <div className="p-6">
                <ExperienceSwitcher appearance="quiet-light" density="comfortable" />
                <div className="flex flex-col gap-1 mt-6">
                  {navLinks.map((link) =>
                    onBeyond && 'end' in link ? (
                      <div key={link.name}>
                        <Link
                          to={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={isBeyondNavCurrent(location.pathname, link.href, link.end) ? 'page' : undefined}
                          className="block touch-manipulation text-lg font-medium text-neutral-800 hover:text-black active:text-neutral-500 transition-colors py-4 border-b border-neutral-100"
                        >
                          {link.name}
                        </Link>
                      </div>
                    ) : (
                      <button
                        key={link.name}
                        onClick={(e) =>
                          link.href.startsWith('/#')
                            ? handleLinkClick(link.href, e)
                            : (setIsMobileMenuOpen(false), navigate(link.href))
                        }
                        className="touch-manipulation text-lg font-medium text-neutral-800 hover:text-black active:text-neutral-500 transition-colors py-4 border-b border-neutral-100 text-left w-full"
                      >
                        {link.name}
                      </button>
                    )
                  )}
                  {sessionLink && (
                    <div>
                      <Link
                        to={sessionLink.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block touch-manipulation text-lg font-medium text-neutral-800 hover:text-black active:text-neutral-500 transition-colors py-4 border-b border-neutral-100"
                        aria-label={sessionLink.aria}
                      >
                        {sessionLink.label}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;

