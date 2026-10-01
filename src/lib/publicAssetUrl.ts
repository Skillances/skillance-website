import { PUBLIC_S3_CATEGORY_IMAGES_BASE } from '@/lib/s3CategoryLottie';

/**
 * Files in the public bucket are served from the Azure container. Some stored
 * URLs still use a virtual-hosted S3 host for a bucket that does not exist
 * (`skillance-public.s3.<region>.amazonaws.com`). Same object key, working host.
 */
const PUBLIC_ASSET_BASE = PUBLIC_S3_CATEGORY_IMAGES_BASE.replace(/\/category-images\/?$/, '');

const DEAD_S3_HOST = /^skillance-public\.s3\.[a-z0-9-]+\.amazonaws\.com$/i;

export function publicAssetUrl(url: string | null | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  try {
    const parsed = new URL(url);
    if (!DEAD_S3_HOST.test(parsed.hostname)) return url;
    const key = parsed.pathname.replace(/^\/+/, '');
    return key ? `${PUBLIC_ASSET_BASE}/${key}${parsed.search}` : url;
  } catch {
    return url;
  }
}
