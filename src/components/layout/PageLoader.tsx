import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SITE_EXPERIENCE_PAPER } from '@/lib/layout/siteChrome';
import {
  loaderBackdropForVideo,
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
const EXIT_MS = 0.55;
const FALLBACK_MS = 1200;
const VIDEO_START_TIMEOUT_MS = 2000;
const SAFETY_MAX_MS = 12000;
const END_HOLD_MS = 280;

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
  const [videoReady, setVideoReady] = useState(false);
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
  const warmPaper = useWarmPaperLoader(surfaceColor);
  const loaderBackdrop = loaderBackdropForVideo(surfaceColor, videoSrc);
  const [useBlendMultiply, setUseBlendMultiply] = useState(false);
  const portraitEncode = videoSrc.includes('9x16');
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
    window.setTimeout(() => finishSession(), END_HOLD_MS);
  }, [finishSession]);

  useEffect(() => {
    if (!isVisible) {
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
      onComplete();
      return;
    }

    document.documentElement.style.backgroundColor = loaderBackdrop;
    document.body.style.backgroundColor = loaderBackdrop;
    return () => {
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
    };
  }, [isVisible, loaderBackdrop, onComplete]);

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

  useEffect(() => {
    if (!warmPaper) {
      setUseBlendMultiply(false);
      return;
    }
    const narrow = window.matchMedia('(max-width: 767px)');
    const coarse = window.matchMedia('(pointer: coarse)');
    const update = () => {
      setUseBlendMultiply(!(narrow.matches || coarse.matches));
    };
    update();
    narrow.addEventListener('change', update);
    coarse.addEventListener('change', update);
    return () => {
      narrow.removeEventListener('change', update);
      coarse.removeEventListener('change', update);
    };
  }, [warmPaper]);

  const blendClass = warmPaper && useBlendMultiply ? 'mix-blend-multiply' : '';

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
          className="fixed inset-0 z-[105] flex flex-col items-center justify-center overflow-hidden px-4 isolation-isolate"
          style={{ backgroundColor: loaderBackdrop }}
        >
          <button
            type="button"
            onClick={skip}
            className="absolute top-6 right-6 z-20 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-600 hover:border-neutral-400 hover:text-black transition-colors"
          >
            Skip
          </button>

          <div className="flex w-full justify-center px-2 sm:px-0">
            <div
              className={`relative overflow-hidden ${
                portraitEncode ? 'aspect-[9/16]' : 'aspect-video'
              } h-[min(64vh,640px)] sm:h-[min(72vh,820px)] w-auto max-w-full`}
              style={{
                backgroundColor: loaderBackdrop,
                maxWidth: portraitEncode
                  ? 'min(100%, calc(min(72vh, 820px) * 9 / 16))'
                  : 'min(100%, calc(min(72vh, 820px) * 16 / 9))',
              }}
            >
              {!reducedMotion && !useEndFrame ? (
                <motion.video
                  ref={videoRef}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{
                    opacity: videoReady ? 1 : 0,
                    scale: videoReady ? 1 : 0.985,
                  }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className={`h-full w-full object-contain ${blendClass}`}
                  style={{ backgroundColor: loaderBackdrop }}
                  src={videoSrc}
                  poster={posterSrc}
                  muted
                  playsInline
                  autoPlay
                  preload="auto"
                  onLoadedData={() => setVideoReady(true)}
                  onPlaying={() => setVideoReady(true)}
                  onEnded={handleVideoEnded}
                />
              ) : (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  src={endFrameSrc}
                  alt=""
                  className={`h-full w-full object-contain ${blendClass}`}
                  width={portraitEncode ? 1080 : 1920}
                  height={portraitEncode ? 1920 : 1080}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
