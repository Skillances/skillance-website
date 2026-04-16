import { getAccessToken } from '@/lib/api';
import { resolveLottieJsonFetchUrl, lottieJsonFetchRequiresAuth } from '@/lib/s3CategoryLottie';

const STORAGE_PREFIX = 'skl_admin_lottie_v1:';
/** Keep in sync across tabs; bump prefix if JSON shape changes. */
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface CacheEntry {
  t: number;
  d: unknown;
}

const memory = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

function storageKey(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = Math.imul(31, h) + url.charCodeAt(i) | 0;
  }
  return `${STORAGE_PREFIX}${(h >>> 0).toString(16)}_${url.length}`;
}

function isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.t < TTL_MS;
}

function readLocalStorage(url: string): CacheEntry | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(url));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (!entry || typeof entry.t !== 'number' || !('d' in entry)) return null;
    if (!isFresh(entry)) {
      localStorage.removeItem(storageKey(url));
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeLocalStorage(url: string, entry: CacheEntry): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(url), JSON.stringify(entry));
  } catch {
    // QuotaExceededError or private mode: memory cache still works this session.
  }
}

/**
 * Returns cached Lottie animationData for this canonical asset URL, or null.
 */
export function getCategoryLottieFromCache(url: string): unknown | null {
  const mem = memory.get(url);
  if (mem) {
    if (isFresh(mem)) return mem.d;
    memory.delete(url);
  }
  const fromLs = readLocalStorage(url);
  if (fromLs) {
    memory.set(url, fromLs);
    return fromLs.d;
  }
  return null;
}

function writeCategoryLottieCache(url: string, data: unknown): void {
  const entry: CacheEntry = { t: Date.now(), d: data };
  memory.set(url, entry);
  writeLocalStorage(url, entry);
}

/**
 * Fetch Lottie JSON with memory + localStorage cache and in-flight deduplication.
 * `url` should be the canonical category imageUrl (S3), not the resolved proxy URL.
 */
export function fetchCategoryLottieJsonCached(src: string): Promise<unknown> {
  const cached = getCategoryLottieFromCache(src);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  const pending = inFlight.get(src);
  if (pending) return pending;

  const promise = (async () => {
    const resolved = resolveLottieJsonFetchUrl(src);

    const authHeaders = (): HeadersInit => {
      if (!lottieJsonFetchRequiresAuth(resolved)) {
        return { Accept: 'application/json' };
      }
      const token = getAccessToken();
      return token
        ? { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        : { Accept: 'application/json' };
    };

    /** Public bucket objects may be readable cross-origin when CORS allows; use when admin proxy errors (e.g. env hostname mismatch). */
    const tryDirectPublicUrl = async (): Promise<unknown | null> => {
      if (!src.startsWith('https://')) return null;
      try {
        const r = await fetch(src, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'default',
          headers: { Accept: 'application/json' },
        });
        if (!r.ok) return null;
        return (await r.json()) as unknown;
      } catch {
        return null;
      }
    };

    const r = await fetch(resolved, {
      credentials: 'include',
      headers: authHeaders(),
    });

    if (!r.ok && lottieJsonFetchRequiresAuth(resolved)) {
      const direct = await tryDirectPublicUrl();
      if (direct !== null) {
        writeCategoryLottieCache(src, direct);
        return direct;
      }
    }

    if (!r.ok) throw new Error(String(r.status));
    const json: unknown = await r.json();
    writeCategoryLottieCache(src, json);
    return json;
  })();

  inFlight.set(src, promise);
  promise.finally(() => {
    inFlight.delete(src);
  });
  return promise;
}
