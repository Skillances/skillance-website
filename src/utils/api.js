/**
 * API utility for making authenticated requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise = null;

/**
 * Get stored access token from localStorage (fallback for mobile apps)
 * Cookies are preferred for web, but we keep this for compatibility
 */
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from localStorage
 */
function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

/**
 * Store tokens in localStorage (for mobile app compatibility)
 */
function storeTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clear tokens from localStorage
 */
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
  // If already refreshing, return the existing promise
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

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Refresh failed' }));
        throw new Error(error.message || 'Token refresh failed');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        
        // Store tokens in localStorage (for mobile app compatibility)
        storeTokens(accessToken, newRefreshToken);
        
        return { accessToken, refreshToken: newRefreshToken };
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      // Refresh failed - clear tokens and redirect to login
      clearTokens();
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Make an authenticated API request with automatic token refresh
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @param {boolean} retryOn401 - Whether to retry on 401 (default: true)
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, options = {}, retryOn401 = true) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists (for mobile app compatibility)
  // Cookies are sent automatically by the browser
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add X-Requested-With header for CSRF protection (required by backend)
  headers['X-Requested-With'] = 'XMLHttpRequest';

  const config = {
    ...options,
    headers,
    credentials: 'include', // Include cookies (httpOnly cookies)
  };

  try {
    let response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && retryOn401) {
      // Don't try to refresh if this is already a refresh request
      if (endpoint === '/auth/refresh') {
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }

      try {
        // Attempt to refresh the token
        const { accessToken } = await refreshAccessToken();
        
        // Retry the original request with new token
        headers.Authorization = `Bearer ${accessToken}`;
        response = await fetch(url, {
          ...config,
          headers,
        });

        // If still 401 after refresh, authentication failed
        if (response.status === 401) {
          clearTokens();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          throw new Error('Authentication required');
        }
      } catch (refreshError) {
        // Refresh failed - already handled in refreshAccessToken
        throw refreshError;
      }
    } else if (response.status === 401) {
      // 401 and retryOn401 is false - clear tokens and redirect
      clearTokens();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    return response;
  } catch (error) {
    // Re-throw network errors
    if (error.message === 'Authentication required' || error.message.includes('Token refresh')) {
      throw error;
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

/**
 * Make a POST request
 */
export async function post(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

/**
 * Make a GET request
 */
export async function get(endpoint) {
  const response = await apiRequest(endpoint, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

/**
 * Make a PUT request
 */
export async function put(endpoint, data) {
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

/**
 * Make a DELETE request
 */
export async function del(endpoint) {
  const response = await apiRequest(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw error;
  }

  return response.json();
}

// Export helper functions for AuthContext
export { storeTokens, clearTokens, getAccessToken, getRefreshToken };

export default {
  apiRequest,
  post,
  get,
  put,
  delete: del,
  storeTokens,
  clearTokens,
};

