import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuToggleIcon } from '../ui/menu-toggle-icon';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getLenisFromWindow, getSectionScrollTopReservePx, scrollToPageSection } from '@/lib/sectionScroll';

interface NavigationProps {
  isLoaded: boolean;
}

const Navigation = ({ isLoaded }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkSection, setIsDarkSection] = useState(true); // Start with dark (hero)
  const [isPastHero, setIsPastHero] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const lenis = getLenisFromWindow();
      const scrollY = lenis?.scroll ?? window.scrollY;
      
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
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Mission', href: '/#mission' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Services', href: '/#services' },
    { name: 'Reviews', href: '/#reviews' },
    { name: 'Contact', href: '/contact' },
    { name: 'Trust', href: '/#trust-safety' },
  ];

  const scrollToSection = (sectionId: string) => {
    let attempts = 0;

    const runScroll = () => {
      attempts += 1;
      const element = document.getElementById(sectionId);

      if (!element) {
        if (attempts < 20) window.setTimeout(runScroll, 60);
        return;
      }

      const lenis = getLenisFromWindow();
      if (!lenis && attempts < 20) {
        window.setTimeout(runScroll, 60);
        return;
      }

      scrollToPageSection(element, lenis);
    };

    runScroll();
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

  if (!isLoaded) return null;

  // Determine text and button colors based on section
  const textColor = isDarkSection ? 'text-white' : 'text-black';
  const textColorMuted = isDarkSection ? 'text-white/70' : 'text-neutral-600';
  const hoverColor = isDarkSection ? 'hover:text-white' : 'hover:text-black';
  const underlineColor = isDarkSection ? 'bg-white' : 'bg-black';

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
        className="fixed top-8 left-0 right-0 z-50 py-5 transition-all duration-500"
        style={{
          backgroundColor: isPastHero || location.pathname !== '/'
            ? (isDarkSection ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.85)')
            : 'transparent',
          backdropFilter: isPastHero || location.pathname !== '/' ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: isPastHero || location.pathname !== '/' ? 'blur(20px)' : 'none',
          borderBottom: location.pathname !== '/' || isPastHero ? (isDarkSection ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)') : 'none'
        }}
      >
        {(isPastHero || location.pathname !== '/') && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              filter: 'url(#nav-grain)',
              opacity: 0.04,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1">
              {navLinks.slice(0, 3).map((link) => (
                <button
                  key={link.name}
                  onClick={(e) => link.href.startsWith('/#') ? handleLinkClick(link.href, e) : navigate(link.href)}
                  className={`text-sm font-medium transition-colors duration-300 relative group ${textColorMuted} ${hoverColor}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${underlineColor}`} />
                </button>
              ))}
            </div>

            {/* Centered Logo */}
            <Link
              to="/"
              className={`flex items-center gap-3 font-serif text-2xl font-medium tracking-tight transition-colors duration-300 ${textColor}`}
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

            {/* Right Navigation */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
              {navLinks.slice(3).map((link) => (
                <button
                  key={link.name}
                  onClick={(e) => link.href.startsWith('/#') ? handleLinkClick(link.href, e) : navigate(link.href)}
                  className={`text-sm font-medium transition-colors duration-300 relative group ${textColorMuted} ${hoverColor}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-px transition-all duration-300 group-hover:w-full ${underlineColor}`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 transition-colors relative z-50 text-black"
              aria-label="Toggle menu"
            >
              <MenuToggleIcon 
                open={isMobileMenuOpen} 
                className="w-8 h-8" 
                duration={500} 
                stroke={isMobileMenuOpen ? 'black' : (isDarkSection ? 'white' : 'black')}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[100] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className="absolute top-9 right-0 w-full sm:w-80 h-[calc(100%-2.25rem)] bg-white shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
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
                  className="p-2 -mr-2"
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8 text-black" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, i) => (
                    <motion.button
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
                      onClick={(e) => link.href.startsWith('/#') ? handleLinkClick(link.href, e) : (setIsMobileMenuOpen(false), navigate(link.href))}
                      className="text-lg font-medium text-neutral-800 hover:text-black active:text-neutral-500 transition-colors py-4 border-b border-neutral-100 text-left"
                    >
                      {link.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;

