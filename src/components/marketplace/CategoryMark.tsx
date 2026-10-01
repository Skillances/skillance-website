import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { isLottieImageUrl } from '@/components/admin/CategoryLottieThumb';
import { fetchCategoryLottieJsonCached } from '@/lib/lottieBrowserCache';
import { getPrefersReducedMotion } from '@/lib/motion';

const box = 'h-12 w-12 shrink-0 rounded-xl bg-mk-muted';

/**
 * Category artwork from the API is usually a Lottie JSON file. An `<img>` of that URL
 * renders as a broken image. Match the app: play Lottie, otherwise show a photo or SVG.
 */
export function CategoryMark({ url }: { url?: string | null }) {
  if (!url) return <span className={box} aria-hidden="true" />;
  if (isLottieImageUrl(url)) return <CategoryLottieMark key={url} src={url} />;
  return <CategoryPhoto key={url} url={url} />;
}

function CategoryPhoto({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={box} aria-hidden="true" />;
  return (
    <img
      src={url}
      alt=""
      className={`${box} object-contain`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function CategoryLottieMark({ src }: { src: string }) {
  const [data, setData] = useState<unknown | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
  }, [src]);

  if (failed || data === null) {
    return <span className={failed ? box : `${box} animate-pulse motion-reduce:animate-none`} aria-hidden="true" />;
  }

  const reduce = getPrefersReducedMotion();
  return (
    <span className={`${box} flex items-center justify-center overflow-hidden`} aria-hidden="true">
      <Lottie animationData={data} loop={!reduce} autoplay={!reduce} style={{ width: 48, height: 48 }} />
    </span>
  );
}
