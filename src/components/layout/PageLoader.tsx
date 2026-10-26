import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SITE_EXPERIENCE_PAPER } from '@/lib/layout/siteChrome';
import {
  pickAssemblyEndFrameSrc,
  pickAssemblyPosterSrc,
  pickAssemblyVideoSrc,
  useWarmPaperLoader,
} from '@/lib/layout/loaderBrandAssets';

interface PageLoaderProps {
  onComplete: () => void;
  /** Match destination shell (marketing white vs Beyond cream). */
  surfaceColor?: string;
}

const SESSION_KEY = 'skillance_loaded';
const EXIT_MS = 0.45;
const FALLBACK_MS = 1200;
const VIDEO_START_TIMEOUT_MS = 1500;
const SAFETY_MAX_MS = 18000;

function readSessionLoaded(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

const PageLoader = ({ onComplete, surfaceColor = SITE_EXPERIENCE_PAPER }: PageLoaderProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(() => !readSessionLoaded());
  const [isExiting, setIsExiting] = useState(false);
  const [useEndFrame, setUseEndFrame] = useState(reducedMotion);
  const [videoSrc] = useState(() => {
    const warm = useWarmPaperLoader(surfaceColor);
    return typeof window !== 'undefined'
      ? pickAssemblyVideoSrc(warm)
      : '/brand/logo_assembly_clean_16x9.mp4';
  });
  const [posterSrc] = useState(() => {
    const warm = useWarmPaperLoader(surfaceColor);
    return typeof window !== 'undefined'
      ? pickAssemblyPosterSrc(warm)
      : '/brand/logo_assembly_clean_16x9_poster.webp';
  });
  const [endFrameSrc] = useState(() => {
    if (typeof window === 'undefined') return '/brand/logo_assembly_clean_16x9_end.webp';
    const warm = useWarmPaperLoader(surfaceColor);
    return pickAssemblyEndFrameSrc(warm);
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);
  const fallbackExitRef = useRef<number | null>(null);

  const finishSession = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (fallbackExitRef.current != null) {
      window.clearTimeout(fallbackExitRef.current);
      fallbackExitRef.current = null;
    }
    sessionStorage.setItem(SESSION_KEY, 'true');
    onComplete();
    setIsExiting(true);
  }, [onComplete]);

  const skip = useCallback(() => {
    finishSession();
  }, [finishSession]);

  const handleVideoEnded = useCallback(() => {
    videoRef.current?.pause();
    finishSession();
  }, [finishSession]);

  useEffect(() => {
    if (!isVisible) {
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
      onComplete();
      return;
    }

    document.documentElement.style.backgroundColor = surfaceColor;
    document.body.style.backgroundColor = surfaceColor;
    return () => {
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
    };
  }, [isVisible, onComplete, surfaceColor]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (reducedMotion) {
      const timer = window.setTimeout(() => finishSession(), FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }

    const safetyTimer = window.setTimeout(() => finishSession(), SAFETY_MAX_MS);

    const startTimeout = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.currentTime > 0 || !video.paused) return;
      setUseEndFrame(true);
      fallbackExitRef.current = window.setTimeout(() => finishSession(), FALLBACK_MS);
    }, VIDEO_START_TIMEOUT_MS);

    return () => {
      window.clearTimeout(safetyTimer);
      window.clearTimeout(startTimeout);
      if (fallbackExitRef.current != null) {
        window.clearTimeout(fallbackExitRef.current);
      }
    };
  }, [finishSession, isVisible, onComplete, reducedMotion]);

  useEffect(() => {
    if (!isVisible || reducedMotion || useEndFrame) return;
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      void video.play().catch(() => {
        /* start-timeout fallback handles blocked autoplay */
      });
    };

    if (video.readyState >= 2) {
      tryPlay();
      return;
    }

    video.addEventListener('loadeddata', tryPlay, { once: true });
    video.load();
    tryPlay();

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
    };
  }, [isVisible, reducedMotion, useEndFrame, videoSrc]);

  useEffect(() => {
    const onKeyDown = () => {
      if (!isVisible || isExiting) return;
      skip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExiting, isVisible, skip]);

  return (
    <AnimatePresence>
      {isVisible && !isExiting && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            setIsVisible(false);
          }}
          transition={{ duration: EXIT_MS, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[105] flex flex-col items-center justify-center overflow-hidden px-4"
          style={{ backgroundColor: surfaceColor }}
        >
          <button
            type="button"
            onClick={skip}
            className="absolute top-6 right-6 z-20 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-600 hover:border-neutral-400 hover:text-black transition-colors"
          >
            Skip
          </button>

          <div className="flex w-full max-w-3xl items-center justify-center">
            {!reducedMotion && !useEndFrame ? (
              <video
                ref={videoRef}
                className="w-full max-h-[45vh] object-contain bg-transparent"
                style={{ backgroundColor: 'transparent' }}
                src={videoSrc}
                poster={posterSrc}
                muted
                playsInline
                autoPlay
                preload="auto"
                onEnded={handleVideoEnded}
              />
            ) : (
              <img
                src={endFrameSrc}
                alt=""
                className="w-full max-h-[45vh] object-contain"
                width={1920}
                height={1080}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
