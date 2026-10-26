import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandWrittenTitle } from '../ui/hand-writing-text';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface PageLoaderProps {
  onComplete: () => void;
}

const SESSION_KEY = 'skillance_loaded';
const WORDMARK_FADE_MS = 5200;
const EXIT_MS = 6600;
const FALLBACK_MS = 1200;
const VIDEO_START_TIMEOUT_MS = 1500;

function pickAssemblyVideoSrc(): string {
  const portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  return portrait ? '/brand/logo_assembly_9x16.mp4' : '/brand/logo_assembly_16x9.mp4';
}

function pickAssemblyPosterSrc(): string {
  const portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
  return portrait ? '/brand/logo_assembly_9x16_poster.webp' : '/brand/logo_assembly_16x9_poster.webp';
}

function readSessionLoaded(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

const PageLoader = ({ onComplete }: PageLoaderProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(() => !readSessionLoaded());
  const [isExiting, setIsExiting] = useState(false);
  const [showWordmark, setShowWordmark] = useState(reducedMotion);
  const [useEndFrame, setUseEndFrame] = useState(reducedMotion);
  const [videoSrc] = useState(() =>
    typeof window !== 'undefined' ? pickAssemblyVideoSrc() : '/brand/logo_assembly_16x9.mp4',
  );
  const [posterSrc] = useState(() =>
    typeof window !== 'undefined' ? pickAssemblyPosterSrc() : '/brand/logo_assembly_16x9_poster.webp',
  );
  const [endFrameSrc] = useState(() => {
    if (typeof window === 'undefined') return '/brand/logo_assembly_16x9_end.webp';
    const portrait = window.matchMedia('(max-aspect-ratio: 1/1)').matches;
    return portrait ? '/brand/logo_assembly_9x16_end.webp' : '/brand/logo_assembly_16x9_end.webp';
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  const finishSession = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsExiting(true);
  }, []);

  const skip = useCallback(() => {
    finishSession();
  }, [finishSession]);

  useEffect(() => {
    if (!isVisible) {
      onComplete();
      return;
    }

    if (reducedMotion) {
      const timer = window.setTimeout(() => finishSession(), FALLBACK_MS);
      return () => window.clearTimeout(timer);
    }

    const wordmarkTimer = window.setTimeout(() => setShowWordmark(true), WORDMARK_FADE_MS);
    const exitTimer = window.setTimeout(() => finishSession(), EXIT_MS);

    const startTimeout = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.currentTime > 0 || !video.paused) return;
      setUseEndFrame(true);
      setShowWordmark(true);
      window.setTimeout(() => finishSession(), FALLBACK_MS);
    }, VIDEO_START_TIMEOUT_MS);

    return () => {
      window.clearTimeout(wordmarkTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(startTimeout);
    };
  }, [finishSession, isVisible, onComplete, reducedMotion]);

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
            onComplete();
            setIsVisible(false);
          }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-[105] bg-white flex flex-col items-center justify-center overflow-hidden px-4"
        >
          <button
            type="button"
            onClick={skip}
            className="absolute top-6 right-6 z-20 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-neutral-600 hover:border-neutral-400 hover:text-black transition-colors"
          >
            Skip
          </button>

          <div className="flex flex-col items-center justify-center w-full max-w-3xl gap-4">
            {!reducedMotion && !useEndFrame ? (
              <video
                ref={videoRef}
                className="w-full max-h-[45vh] object-contain bg-white"
                src={videoSrc}
                poster={posterSrc}
                muted
                playsInline
                autoPlay
                preload="auto"
                onPlaying={() => setUseEndFrame(false)}
                onEnded={() => {
                  setUseEndFrame(true);
                }}
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

            {showWordmark ? (
              <HandWrittenTitle variant="loader" showStrokes={!reducedMotion && !useEndFrame} />
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
