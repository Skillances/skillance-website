/**
 * API utility for making authenticated requests to the backend
 */

import { ApiPaths } from '@/lib/apiEndpoints';
import { isFreelancerProfileWrite, omitPayoutReferenceId, pausedPaymentError } from '@/lib/paymentsPaused';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** Base URL for unauthenticated probes (e.g. `/health`). */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

type TokenPair = { accessToken: string; refreshToken?: string };

/** Fetch options accepted by {@link apiRequest}; headers are merged with auth defaults. */
type ApiRequestOptions = Omit<RequestInit, 'headers'> & { headers?: Record<string, string> };

/** Every request (including token refresh) is aborted after this long. */
export const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Cookie mode: the backend keeps the refresh token in an httpOnly cookie, so the browser never
 * stores or sends one in a body. Enable with `VITE_AUTH_REFRESH_COOKIE=true` once the backend
 * sets that cookie on login/refresh. Otherwise the refresh token is the only persisted secret.
 */
const REFRESH_COOKIE_MODE = import.meta.env.VITE_AUTH_REFRESH_COOKIE === 'true';

const REFRESH_TOKEN_KEY = 'refreshToken';
/** Non-secret marker (cookie mode) so anonymous visitors skip a pointless refresh call. */
const SESSION_HINT_KEY = 'skillance_session';
/** Keys written by older builds that kept the access token and user object in localStorage. */
const LEGACY_ACCESS_TOKEN_KEY = 'accessToken';
const LEGACY_USER_KEY = 'user';

/** The access token lives in memory only: it never touches web storage. */
let accessToken: string | null = null;
let refreshInFlight: Promise<TokenPair> | null = null;

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode / blocked): the session just won't survive a reload.
  }
}

/**
 * One-time migration from older builds: load the stored access token into memory, then delete
 * the access token and user object from localStorage. In cookie mode the stored refresh token is
 * dropped too (the cookie replaces it); otherwise it stays, as it is needed to survive a reload.
 */
export function migrateLegacyAuthStorage(): void {
  const legacyAccess = readStorage(LEGACY_ACCESS_TOKEN_KEY);
  if (legacyAccess && !accessToken) accessToken = legacyAccess;
  writeStorage(LEGACY_ACCESS_TOKEN_KEY, null);
  writeStorage(LEGACY_USER_KEY, null);

  if (REFRESH_COOKIE_MODE) {
    const hadSession = Boolean(readStorage(REFRESH_TOKEN_KEY) || legacyAccess);
    writeStorage(REFRESH_TOKEN_KEY, null);
    if (hadSession) writeStorage(SESSION_HINT_KEY, '1');
  }
}

migrateLegacyAuthStorage();

export function getAccessToken(): string | null {
  return accessToken;
}

function getStoredRefreshToken(): string | null {
  return REFRESH_COOKIE_MODE ? null : readStorage(REFRESH_TOKEN_KEY);
}

/** True when this browser may hold a session worth validating or refreshing. */
export function hasStoredSession(): boolean {
  if (accessToken) return true;
  return REFRESH_COOKIE_MODE ? readStorage(SESSION_HINT_KEY) === '1' : Boolean(readStorage(REFRESH_TOKEN_KEY));
}

export function storeTokens(newAccessToken: string, newRefreshToken?: string): void {
  if (newAccessToken) accessToken = newAccessToken;
  if (REFRESH_COOKIE_MODE) {
    if (newAccessToken) writeStorage(SESSION_HINT_KEY, '1');
  } else if (newRefreshToken) {
    writeStorage(REFRESH_TOKEN_KEY, newRefreshToken);
  }
}

export function clearTokens(): void {
  accessToken = null;
  writeStorage(REFRESH_TOKEN_KEY, null);
  writeStorage(SESSION_HINT_KEY, null);
  writeStorage(LEGACY_ACCESS_TOKEN_KEY, null);
  writeStorage(LEGACY_USER_KEY, null);
}

/** `fetch` that aborts after {@link REQUEST_TIMEOUT_MS}, still honouring a caller-supplied signal. */
function fetchWithTimeout(input: string, init: RequestInit = {}): Promise<Response> {
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
}

/** Backend sends this when the client IP is security-blocked (login, refresh, and API calls). */
function responseIndicatesIpBlocked(status: number, body: { code?: string }) {
  return (status === 403 || status === 404) && body?.code === 'ip_blocked';
}

/** Concurrent callers share one in-flight refresh so a rotating refresh token is never reused. */
function refreshAccessToken(): Promise<TokenPair> {
  if (refreshInFlight) return refreshInFlight;

  const attempt = (async (): Promise<TokenPair> => {
    try {
      const refreshToken = getStoredRefreshToken();
      if (!REFRESH_COOKIE_MODE && !refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}${ApiPaths.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify(REFRESH_COOKIE_MODE ? {} : { refreshToken }),
      });

      if (!response.ok) {
        const error = (await response.json().catch(() => ({ message: 'Refresh failed' }))) as {
          message?: string;
        };
        throw new Error(error.message || 'Token refresh failed');
      }

      const data = await response.json();
      if (!data?.success || !data.data?.accessToken) {
        throw new Error(data?.message || 'Token refresh failed');
      }
      const pair: TokenPair = {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      };
      storeTokens(pair.accessToken, pair.refreshToken);
      return pair;
    } catch (error) {
      clearTokens();
      throw error;
    }
  })();

  refreshInFlight = attempt;
  const release = () => {
    if (refreshInFlight === attempt) refreshInFlight = null;
  };
  attempt.then(release, release);
  return attempt;
}

export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {},
  retryOn401 = true,
): Promise<Response> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = getAccessToken();
  const hasSession = hasStoredSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers['X-Requested-With'] = 'XMLHttpRequest';

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetchWithTimeout(url, config);

    if (hasSession && (response.status === 403 || response.status === 404)) {
      const body = (await response
        .clone()
        .json()
        .catch(() => ({}))) as { code?: string };
      if (responseIndicatesIpBlocked(response.status, body)) {
        clearTokens();
        throw new Error('Authentication required');
      }
    }

    if (response.status === 401 && retryOn401 && hasSession) {
      if (endpoint === ApiPaths.auth.refresh) {
        clearTokens();
        throw new Error('Authentication required');
      }

      // Another request may already have rotated the token while this one was in flight.
      const current = getAccessToken();
      const freshToken = current && current !== token ? current : (await refreshAccessToken()).accessToken;
      headers.Authorization = `Bearer ${freshToken}`;
      response = await fetchWithTimeout(url, {
        ...config,
        headers,
      });

      if (response.status === 401) {
        clearTokens();
        throw new Error('Authentication required');
      }
    } else if (response.status === 401) {
      // Public pages can call public endpoints without auth state.
      // Avoid forcing login redirect when there is no stored session.
      if (!hasSession) {
        throw new Error('Unauthorized');
      }
      clearTokens();
      throw new Error('Authentication required');
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('Network error: request timed out');
    }
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'Authentication required' || message.includes('Token refresh')) {
      throw error;
    }
    throw new Error(`Network error: ${message}`);
  }
}

/** Untyped `{ success, data, message }` JSON envelope; callers narrow it themselves. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the single, deliberate escape hatch for untyped API responses
export type ApiEnvelope = any;

/** Non-2xx JSON, with the HTTP status attached when the body omits it. */
async function throwResponseError(response: Response): Promise<never> {
  const fallback = { message: 'Request failed', statusCode: response.status };
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw fallback;
  }
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    const record = body as { statusCode?: unknown };
    if (typeof record.statusCode !== 'number') record.statusCode = response.status;
    throw body;
  }
  throw { message: typeof body === 'string' && body.trim() ? body : 'Request failed', statusCode: response.status };
}

async function readJson(response: Response): Promise<unknown> {
  if (response.status === 204) return { success: true };
  const text = await response.text();
  if (!text.trim()) return { success: true };
  return omitPayoutReferenceId(JSON.parse(text));
}

export async function post(endpoint: string, data: unknown): Promise<ApiEnvelope> {
  const paused = pausedPaymentError(endpoint);
  if (paused) throw paused;

  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) await throwResponseError(response);
  return readJson(response);
}

export async function get(endpoint: string): Promise<ApiEnvelope> {
  const response = await apiRequest(endpoint, {
    method: 'GET',
  });

  if (!response.ok) await throwResponseError(response);
  return readJson(response);
}

export async function put(endpoint: string, data: unknown): Promise<ApiEnvelope> {
  const body = isFreelancerProfileWrite(endpoint) ? omitPayoutReferenceId(data) : data;
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

  if (!response.ok) await throwResponseError(response);
  return readJson(response);
}

export async function patch(endpoint: string, data: unknown): Promise<ApiEnvelope> {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) await throwResponseError(response);
  return readJson(response);
}

export async function del(endpoint: string): Promise<ApiEnvelope> {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) await throwResponseError(response);
  return readJson(response);
}

export default {
  apiRequest,
  post,
  get,
  put,
  patch,
  delete: del,
  storeTokens,
  clearTokens,
};
