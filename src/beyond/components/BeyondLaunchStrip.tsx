import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { beyondActiveClientLabel } from '@/beyond/beyondClientCountLabel';
import { BEYOND_SIGNPOST } from '@/beyond/content';
import { useBeyondWork } from '@/beyond/useBeyondWork';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import LaunchStripMarquee, { useLaunchStripMobileMarquee } from '@/components/layout/LaunchStripMarquee';

const ROTATE_MS = 6500;
const STRIP_EASE = [0.23, 1, 0.32, 1] as const;

type StripSlide = 'portfolio' | 'marketplace';

/** Top launch strip with portfolio count + rotating marketplace pointer. */
export default function BeyondLaunchStrip() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const mobileMarquee = useLaunchStripMobileMarquee();
  const { ready, items } = useBeyondWork();
  const count = items.length;
  const clientLabel = beyondActiveClientLabel(ready, count);

  const showMarketplaceSlide = pathname !== '/beyond';
  const slides: StripSlide[] = showMarketplaceSlide ? ['portfolio', 'marketplace'] : ['portfolio'];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? 'portfolio';

  useEffect(() => {
    setActiveIndex(0);
  }, [pathname]);

  useEffect(() => {
    if (slides.length < 2) return;
    const ms = reducedMotion ? ROTATE_MS * 1.5 : ROTATE_MS;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [reducedMotion, slides.length]);

  const handleStripClick = useCallback(() => {
    if (activeSlide === 'marketplace') {
      navigate(BEYOND_SIGNPOST.href);
      return;
    }
    navigate('/beyond/work');
  }, [activeSlide, navigate]);

  const slideMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 },
      };

  const portfolioMarquee = `Skillance Beyond · ${clientLabel} · View client work`;
  const marketplaceMarquee = `${BEYOND_SIGNPOST.stripPrompt} · ${BEYOND_SIGNPOST.stripCta}`;
  const mobileMarqueeText = showMarketplaceSlide
    ? `${portfolioMarquee} · · · ${marketplaceMarquee}`
    : portfolioMarquee;

  return (
    <div
      id="beyond-launch-strip"
      className="by-launch-strip"
      role="region"
      aria-label="Skillance Beyond announcements"
    >
      <button
        type="button"
        className={`by-launch-strip-inner by-launch-strip-ticker${mobileMarquee ? ' by-launch-strip-ticker-marquee' : ''}`}
        onClick={handleStripClick}
        aria-live="polite"
      >
        {mobileMarquee ? (
          <LaunchStripMarquee text={mobileMarqueeText} className="by-launch-strip-marquee" />
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeSlide}
              {...slideMotion}
              transition={{ duration: reducedMotion ? 0.2 : 0.42, ease: STRIP_EASE }}
              className="by-launch-strip-slide"
            >
              {activeSlide === 'portfolio' ? (
                <>
                  <span className="by-launch-strip-kicker">Skillance Beyond</span>
                  <span className="by-launch-strip-main">{clientLabel}</span>
                  <span className="by-launch-strip-divider" aria-hidden="true" />
                  <span className="by-launch-strip-count">View client work</span>
                </>
              ) : (
                <>
                  <span className="by-launch-strip-market-prompt">{BEYOND_SIGNPOST.stripPrompt}</span>
                  <span className="by-launch-strip-divider" aria-hidden="true" />
                  <span className="by-launch-strip-market-cta">{BEYOND_SIGNPOST.stripCta}</span>
                </>
              )}
            </motion.span>
          </AnimatePresence>
        )}
      </button>
    </div>
  );
}
