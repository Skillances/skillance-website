/**
 * Public base URL for category Lottie JSON on S3 (must match backend uploads).
 * Override with VITE_PUBLIC_S3_CATEGORY_BASE in .env when the bucket or path changes.
 */
export const PUBLIC_S3_CATEGORY_IMAGES_BASE =
  (import.meta.env.VITE_PUBLIC_S3_CATEGORY_BASE as string | undefined)?.replace(/\/+$/, '') ||
  'https://skillance-public.s3.af-south-1.amazonaws.com/category-images';

/**
 * In dev, same-origin proxy avoids S3 CORS (localhost is usually not on the bucket CORS list).
 * Production fetches S3 directly; add your site origin to the bucket CORS + connect-src CSP.
 */
export function resolveLottieJsonFetchUrl(src: string): string {
  if (!import.meta.env.DEV) return src;
  const base = PUBLIC_S3_CATEGORY_IMAGES_BASE;
  if (src.startsWith(`${base}/`) || src === base) {
    return `/__dev/s3-public-json?url=${encodeURIComponent(src)}`;
  }
  return src;
}
