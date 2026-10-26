import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMarketingAuthPath } from '@/lib/marketing/authPaths';
import { beyondActiveClientLabel } from '@/beyond/beyondClientCountLabel';
import { useBeyondWork } from '@/beyond/useBeyondWork';
import { MARKETPLACE_SIGNPOST } from '@/constants/experienceSignposts';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

const ROTATE_MS = 6500;
const STRIP_EASE = [0.23, 1, 0.32, 1] as const;

type StripSlide = 'launch' | 'beyond';

const LaunchCountdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const { ready, items } = useBeyondWork();
  const clientCount = items.length;
  const clientLabel = beyondActiveClientLabel(ready, clientCount);

  const slides: StripSlide[] = ['launch', 'beyond'];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? 'launch';

  useEffect(() => {
    setActiveIndex(0);
  }, [location.pathname]);

  useEffect(() => {
    if (slides.length < 2) return;
    const ms = reducedMotion ? ROTATE_MS * 1.5 : ROTATE_MS;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, ms);
    return () => window.clearInterval(id);
  }, [reducedMotion, slides.length]);

  const scrollToLaunchCta = useCallback(() => {
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => {
        document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
      return;
    }
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
  }, [location.pathname, navigate]);

  const handleStripClick = useCallback(() => {
    if (activeSlide === 'beyond') {
      navigate(MARKETPLACE_SIGNPOST.href);
      return;
    }
    scrollToLaunchCta();
  }, [activeSlide, navigate, scrollToLaunchCta]);

  if (isMarketingAuthPath(location.pathname)) {
    return null;
  }

  const slideMotion = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: '100%', opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: '-100%', opacity: 0 },
      };

  return (
    <motion.button
      type="button"
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: STRIP_EASE }}
      onClick={handleStripClick}
      className="fixed top-0 left-0 right-0 z-[60] h-8 overflow-hidden bg-black text-white active:scale-[0.995] transition-transform"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={activeSlide}
          {...slideMotion}
          transition={{ duration: reducedMotion ? 0.2 : 0.42, ease: STRIP_EASE }}
          className="absolute inset-0 flex items-center justify-center px-4"
        >
          {activeSlide === 'launch' ? (
            <span className="flex max-w-full items-center justify-center gap-3 sm:gap-5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.14em] whitespace-nowrap">
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="opacity-60 text-[9px]">Launch:</span>
                <span>To be announced</span>
              </span>
              <span
                className="hidden sm:inline h-3 w-px bg-white/20"
                aria-hidden="true"
              />
              <span className="normal-case tracking-normal font-semibold text-white/90 truncate">
                {clientLabel}
              </span>
            </span>
          ) : (
            <span className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 px-1 text-[9px] sm:text-[11px] font-medium tracking-[0.05em] sm:tracking-[0.08em] sm:whitespace-nowrap">
              <span className="text-center text-white/75 sm:truncate">{MARKETPLACE_SIGNPOST.stripPrompt}</span>
              <span className="shrink-0 font-semibold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-white underline decoration-white/35 underline-offset-[3px]">
                {MARKETPLACE_SIGNPOST.stripCta}
              </span>
            </span>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default LaunchCountdown;
