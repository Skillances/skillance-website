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
 * - Prod: Admin API proxy on the backend (no S3 CORS for the marketing site).
 * - Otherwise: direct URL (e.g. custom CDN with CORS).
 */
export function resolveLottieJsonFetchUrl(src: string): string {
  const base = PUBLIC_S3_CATEGORY_IMAGES_BASE;
  const useProxy = src.startsWith(`${base}/`) || src === base;
  if (!useProxy) return src;

  if (import.meta.env.DEV) {
    return `/__dev/s3-public-json?url=${encodeURIComponent(src)}`;
  }

  return `${API_BASE}/admin/category-images/proxy?url=${encodeURIComponent(src)}`;
}

/** True when the browser must send the admin JWT (production proxy hits the API). */
export function lottieJsonFetchRequiresAuth(url: string): boolean {
  return url.includes('/admin/category-images/proxy');
}
