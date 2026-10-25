import { REQUEST_TIMEOUT_MS, getAccessToken } from '@/lib/api';
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

const CACHE_NAME = 'skl-lottie-v1';
const CACHE_TIMESTAMP_HEADER = 'x-cached-at';

/** Large JSON lives in the Cache API (not localStorage, whose ~5MB sync quota it would eat). */
function persistentRequest(url: string): Request {
  return new Request(`${window.location.origin}/__lottie-cache/${storageKey(url).slice(STORAGE_PREFIX.length)}`);
}

/** One-time cleanup of entries older builds wrote to localStorage. */
function dropLegacyLocalStorageEntries(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable: nothing to clean.
  }
}

async function readPersistent(url: string): Promise<CacheEntry | null> {
  if (typeof caches === 'undefined') return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const request = persistentRequest(url);
    const response = await cache.match(request);
    if (!response) return null;
    const t = Number(response.headers.get(CACHE_TIMESTAMP_HEADER));
    if (!Number.isFinite(t) || !isFresh({ t, d: null })) {
      await cache.delete(request);
      return null;
    }
    return { t, d: (await response.json()) as unknown };
  } catch {
    return null;
  }
}

async function writePersistent(url: string, entry: CacheEntry): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      persistentRequest(url),
      new Response(JSON.stringify(entry.d), {
        headers: { 'Content-Type': 'application/json', [CACHE_TIMESTAMP_HEADER]: String(entry.t) },
      }),
    );
  } catch {
    // QuotaExceededError or unavailable storage: the in-memory cache still works this session.
  }
}

if (typeof window !== 'undefined') dropLegacyLocalStorageEntries();

/**
 * Returns Lottie animationData already held in memory for this canonical asset URL, or null.
 * The persistent copy is async, so it is only consulted by {@link fetchCategoryLottieJsonCached}.
 */
export function getCategoryLottieFromCache(url: string): unknown | null {
  const mem = memory.get(url);
  if (mem) {
    if (isFresh(mem)) return mem.d;
    memory.delete(url);
  }
  return null;
}

function writeCategoryLottieCache(url: string, data: unknown): void {
  const entry: CacheEntry = { t: Date.now(), d: data };
  memory.set(url, entry);
  void writePersistent(url, entry);
}

/**
 * Fetch Lottie JSON with memory + Cache API and in-flight deduplication.
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
    const persisted = await readPersistent(src);
    if (persisted) {
      memory.set(src, persisted);
      return persisted.d;
    }

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
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
