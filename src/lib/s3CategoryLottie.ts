import { ApiPaths } from '@/lib/apiEndpoints';

/**
 * Public base URL for category Lottie JSON on S3 (must match backend uploads).
 * Override with VITE_PUBLIC_S3_CATEGORY_BASE in .env when the bucket or path changes.
 */
export const PUBLIC_S3_CATEGORY_IMAGES_BASE =
  (import.meta.env.VITE_PUBLIC_S3_CATEGORY_BASE as string | undefined)?.replace(/\/+$/, '') ||
  'https://skillance-public.s3.af-south-1.amazonaws.com/category-images';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/**
 * Resolves where to fetch Lottie JSON from:
 * - Dev: Vite middleware same-origin proxy (no S3 CORS for localhost).
 * - Prod: Public API proxy (allowlisted S3 keys only; no admin JWT required).
 * - Otherwise: direct URL (e.g. custom CDN with CORS).
 */
export function resolveLottieJsonFetchUrl(src: string): string {
  const base = PUBLIC_S3_CATEGORY_IMAGES_BASE;
  const useProxy = src.startsWith(`${base}/`) || src === base;
  if (!useProxy) return src;

  const key = src === base ? '' : src.slice(base.length + 1);
  const encodedKey = encodeURIComponent(key);

  if (import.meta.env.DEV) {
    return `/__dev/s3-public-json?key=${encodedKey}`;
  }

  return `${API_BASE}${ApiPaths.public.categoryLottie}?url=${encodeURIComponent(src)}`;
}

/** True when the fetch URL requires a Bearer token (legacy admin-only proxy). */
export function lottieJsonFetchRequiresAuth(url: string): boolean {
  return url.includes('/admin/category-images/proxy');
}
