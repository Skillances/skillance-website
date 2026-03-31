import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';
import { fetchCategoryLottieJsonCached, getCategoryLottieFromCache } from '@/lib/lottieBrowserCache';

/**
 * True when a category image URL points to Lottie JSON (S3 uses .json for lottie uploads).
 */
export function isLottieImageUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return path.endsWith('.json') || path.endsWith('.lottie');
  } catch {
    return /\.(json|lottie)(\?|#|$)/i.test(url);
  }
}

function FallbackBox({ size, className, label }: { size: number; className?: string; label: string }) {
  return (
    <div
      className={cn(
        'rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 shrink-0',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {label}
    </div>
  );
}

interface CategoryLottieThumbProps {
  /** Public URL to Lottie JSON (e.g. S3 category-images/slug.json) */
  src: string;
  size?: number;
  className?: string;
}

/**
 * Fetches Lottie JSON from a URL and renders a small looping preview (admin table, etc.).
 */
export function CategoryLottieThumb({ src, size = 32, className }: CategoryLottieThumbProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [data, setData] = useState<unknown | null>(() => getCategoryLottieFromCache(src));
  const [failed, setFailed] = useState(false);
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const cached = getCategoryLottieFromCache(src);
    if (cached !== null) {
      setInView(true);
      return;
    }
    setInView(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { rootMargin: '120px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [src]);

  useEffect(() => {
    if (!inView) return;

    let cancelled = false;
    setFailed(false);

    const cached = getCategoryLottieFromCache(src);
    if (cached !== null) {
      setData(cached);
      return () => {
        cancelled = true;
      };
    }

    setData(null);

    fetchCategoryLottieJsonCached(src)
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src, inView]);

  useEffect(() => {
    if (!data || failed) return;
    // Ensure playback starts even after recycled table rows/remounts.
    lottieRef.current?.goToAndPlay?.(0, true);
    lottieRef.current?.setSpeed?.(1);
  }, [data, failed]);

  if (failed) {
    return (
      <div ref={rootRef}>
        <FallbackBox size={size} className={className} label="Lottie" />
      </div>
    );
  }
  if (data === null) {
    return (
      <div
        ref={rootRef}
        className={cn('rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse shrink-0', className)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </div>
  );
}

interface CategoryLottieInlineProps {
  animationData: unknown;
  size?: number;
  className?: string;
}

/**
 * Renders Lottie from already-parsed JSON (e.g. file chosen in admin form before upload).
 */
export function CategoryLottieInline({ animationData, size = 48, className }: CategoryLottieInlineProps) {
  if (!animationData || typeof animationData !== 'object') {
    return <FallbackBox size={size} className={className} label="Lottie" />;
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900/50',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Lottie animationData={animationData} loop autoplay style={{ width: size, height: size }} />
    </div>
  );
}
