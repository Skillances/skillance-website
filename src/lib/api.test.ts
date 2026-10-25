import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type ApiModule = typeof import('./api');

const jsonResponse = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function loadApi(options: { cookieMode?: boolean } = {}): Promise<ApiModule> {
  vi.resetModules();
  vi.stubEnv('VITE_AUTH_REFRESH_COOKIE', options.cookieMode ? 'true' : 'false');
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.test');
  return import('./api');
}

describe('api token handling', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('keeps the access token in memory and persists only the refresh token', async () => {
    const api = await loadApi();
    api.storeTokens('access-1', 'refresh-1');

    expect(api.getAccessToken()).toBe('access-1');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBe('refresh-1');
  });

  it('migrates legacy localStorage keys into memory and removes the sensitive ones', async () => {
    localStorage.setItem('accessToken', 'legacy-access');
    localStorage.setItem('refreshToken', 'legacy-refresh');
    localStorage.setItem('user', JSON.stringify({ id: 'u1' }));

    const api = await loadApi();

    expect(api.getAccessToken()).toBe('legacy-access');
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBe('legacy-refresh');
    expect(api.hasStoredSession()).toBe(true);
  });

  it('cookie mode drops the stored refresh token and keeps only a non-secret hint', async () => {
    localStorage.setItem('accessToken', 'legacy-access');
    localStorage.setItem('refreshToken', 'legacy-refresh');

    const api = await loadApi({ cookieMode: true });

    expect(api.getAccessToken()).toBe('legacy-access');
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('skillance_session')).toBe('1');

    api.storeTokens('new-access', 'ignored-refresh');
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('clearTokens wipes memory and every storage key', async () => {
    const api = await loadApi();
    api.storeTokens('a', 'r');
    api.clearTokens();

    expect(api.getAccessToken()).toBeNull();
    expect(api.hasStoredSession()).toBe(false);
    expect(localStorage.length).toBe(0);
  });

  it('shares one in-flight refresh between concurrent 401s', async () => {
    const api = await loadApi();
    api.storeTokens('expired', 'refresh-1');

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return jsonResponse(200, { success: true, data: { accessToken: 'fresh', refreshToken: 'refresh-2' } });
      }
      const auth = (init?.headers as Record<string, string>).Authorization;
      return auth === 'Bearer fresh' ? jsonResponse(200, { ok: true }) : jsonResponse(401);
    });
    vi.stubGlobal('fetch', fetchMock);

    const responses = await Promise.all([api.apiRequest('/a'), api.apiRequest('/b'), api.apiRequest('/c')]);

    expect(responses.every((r) => r.status === 200)).toBe(true);
    const refreshCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/refresh'));
    expect(refreshCalls).toHaveLength(1);
    expect(api.getAccessToken()).toBe('fresh');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-2');
  });

  it('sends the refresh token in the body in legacy mode and an empty body in cookie mode', async () => {
    for (const cookieMode of [false, true]) {
      localStorage.clear();
      const api = await loadApi({ cookieMode });
      api.storeTokens('expired', 'refresh-1');
      if (cookieMode) localStorage.setItem('skillance_session', '1');

      const fetchMock = vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(async (url) =>
        url.endsWith('/auth/refresh')
          ? jsonResponse(200, { success: true, data: { accessToken: 'fresh' } })
          : jsonResponse(200),
      );
      fetchMock.mockImplementationOnce(async () => jsonResponse(401));
      vi.stubGlobal('fetch', fetchMock);

      await api.apiRequest('/me');

      const refreshCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/auth/refresh'));
      const init = refreshCall?.[1] as RequestInit;
      expect(init.credentials).toBe('include');
      expect(JSON.parse(String(init.body))).toEqual(cookieMode ? {} : { refreshToken: 'refresh-1' });
    }
  });

  it('clears all auth state when the refresh fails', async () => {
    const api = await loadApi();
    api.storeTokens('expired', 'refresh-1');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('/auth/refresh') ? jsonResponse(401, { message: 'nope' }) : jsonResponse(401),
      ),
    );

    await expect(api.apiRequest('/me')).rejects.toThrow();

    expect(api.getAccessToken()).toBeNull();
    expect(localStorage.length).toBe(0);
  });

  it('does not refresh for anonymous visitors', async () => {
    const api = await loadApi();
    const fetchMock = vi.fn(async () => jsonResponse(401));
    vi.stubGlobal('fetch', fetchMock);

    await expect(api.apiRequest('/public')).rejects.toThrow('Unauthorized');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('attaches an abort signal to every request, including refresh', async () => {
    const api = await loadApi();
    api.storeTokens('expired', 'refresh-1');
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(init?.signal).toBeInstanceOf(AbortSignal);
      return url.endsWith('/auth/refresh')
        ? jsonResponse(200, { success: true, data: { accessToken: 'fresh', refreshToken: 'r2' } })
        : jsonResponse(200);
    });
    fetchMock.mockImplementationOnce(async () => jsonResponse(401));
    vi.stubGlobal('fetch', fetchMock);

    await api.apiRequest('/me');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reports a timeout as a network error', async () => {
    const api = await loadApi();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('signal timed out', 'TimeoutError');
      }),
    );

    await expect(api.apiRequest('/slow')).rejects.toThrow('Network error: request timed out');
  });
});
