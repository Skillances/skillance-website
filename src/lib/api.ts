/**
 * API utility for making authenticated requests to the backend
 */

import { ApiPaths } from '@/lib/apiEndpoints';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function storeTokens(accessToken: string, refreshToken: string) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}${ApiPaths.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Refresh failed' }));
        throw new Error(error.message || 'Token refresh failed');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        storeTokens(accessToken, newRefreshToken);
        return { accessToken, refreshToken: newRefreshToken };
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest(endpoint: string, options: any = {}, retryOn401 = true): Promise<any> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  const hasStoredSession = Boolean(token || refreshToken);

  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  headers['X-Requested-With'] = 'XMLHttpRequest';

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    let response = await fetch(url, config);

    if (response.status === 401 && retryOn401 && hasStoredSession) {
      if (endpoint === ApiPaths.auth.refresh) {
        clearTokens();
        throw new Error('Authentication required');
      }

      try {
        const { accessToken } = await refreshAccessToken();
        headers.Authorization = `Bearer ${accessToken}`;
        response = await fetch(url, {
          ...config,
          headers,
        });

        if (response.status === 401) {
          clearTokens();
          throw new Error('Authentication required');
        }
      } catch (refreshError) {
        throw refreshError;
      }
    } else if (response.status === 401) {
      // Public pages can call public endpoints without auth state.
      // Avoid forcing login redirect when there is no stored session.
      if (!hasStoredSession) {
        throw new Error('Unauthorized');
      }
      clearTokens();
      throw new Error('Authentication required');
    }

    return response;
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message.includes('Token refresh')) {
      throw error;
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

export async function post(endpoint: string, data: any) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  if (response.status === 204) {
    return { success: true };
  }
  const text = await response.text();
  if (!text.trim()) {
    return { success: true };
  }
  return JSON.parse(text);
}

export async function get(endpoint: string) {
  const response = await apiRequest(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

export async function put(endpoint: string, data: any) {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

export async function del(endpoint: string) {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

export default {
  apiRequest,
  post,
  get,
  put,
  delete: del,
  storeTokens,
  clearTokens,
};
