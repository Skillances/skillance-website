import React, { createContext, useCallback, useContext, useState, useEffect, type ReactNode } from 'react';
import { post, get, clearTokens, hasStoredSession, storeTokens } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import {
  INVALID_LOGIN_CREDENTIALS_MESSAGE,
  LOGIN_RATE_LIMIT_MESSAGE,
  LOGIN_UNAVAILABLE_MESSAGE,
} from '@/lib/marketplace/authMessages';
import { isStaff, toMarketplaceUser, type MarketplaceUser } from '@/lib/marketplace/session';

type User = MarketplaceUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    options?: { rememberMe?: boolean },
  ) => Promise<{ success: boolean; user: User }>;
  /** Stores tokens and the user from an auth response `data` envelope (register, Google sign-in). */
  startSession: (data: unknown) => User;
  /** Re-reads `GET /users/me` and updates the session. Returns the fresh user, or null. */
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components -- hook is colocated with its provider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type ApiErrorLike = {
  message?: string;
  retryAfter?: number;
  statusCode?: number;
  errors?: { message?: string }[];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback((next: User) => {
    setUser(next);
    setIsAuthenticated(true);
    setIsAdmin(isStaff(next));
  }, []);

  const refreshUser = useCallback(async () => {
    const response = await get(ApiPaths.users.me);
    const next = response?.success ? toMarketplaceUser(response.data) : null;
    if (next) applyUser(next);
    return next;
  }, [applyUser]);

  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      if (!hasStoredSession()) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await get(ApiPaths.users.me);
        if (cancelled) return;

        const normalizedUser = response?.success ? toMarketplaceUser(response.data) : null;
        if (normalizedUser) {
          applyUser(normalizedUser);
        }
      } catch {
        if (cancelled) return;
        clearTokens();
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAuthState();
    return () => {
      cancelled = true;
    };
  }, [applyUser]);

  const startSession = useCallback(
    (data: unknown) => {
      const envelope = (data ?? {}) as { accessToken?: string; refreshToken?: string };
      const normalizedUser = toMarketplaceUser(data);
      if (!envelope.accessToken || !normalizedUser) {
        throw new Error('Sign-in response was incomplete. Please sign in.');
      }
      storeTokens(envelope.accessToken, envelope.refreshToken ?? '');
      applyUser(normalizedUser);
      return normalizedUser;
    },
    [applyUser],
  );

  const login = async (
    email: string,
    password: string,
    options?: { rememberMe?: boolean },
  ) => {
    try {
      const sanitizedEmail = email.trim().toLowerCase();

      if (!sanitizedEmail || !password) {
        throw new Error('Email and password are required');
      }

      const response = await post(ApiPaths.auth.login, {
        email: sanitizedEmail,
        password,
        rememberMe: options?.rememberMe === true,
      });

      if (response.success && response.data) {
        const normalizedUser = startSession(response.data);
        return { success: true, user: normalizedUser };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (caught: unknown) {
      const error = (caught ?? {}) as ApiErrorLike;

      if (error.statusCode === 429 || error.retryAfter) {
        const rateLimitError = new Error(error.message || LOGIN_RATE_LIMIT_MESSAGE) as Error & {
          retryAfter?: number;
        };
        rateLimitError.retryAfter = error.retryAfter;
        throw rateLimitError;
      }

      if (error.statusCode === 500 || error.message?.includes(LOGIN_UNAVAILABLE_MESSAGE)) {
        throw new Error(LOGIN_UNAVAILABLE_MESSAGE);
      }

      if (
        error.statusCode === 401 ||
        error.errors?.length ||
        error.message?.includes(INVALID_LOGIN_CREDENTIALS_MESSAGE) ||
        error.message?.includes('Invalid credentials') ||
        error.message?.includes('User not found') ||
        error.message?.includes('Validation failed')
      ) {
        throw new Error(INVALID_LOGIN_CREDENTIALS_MESSAGE);
      }

      throw new Error(INVALID_LOGIN_CREDENTIALS_MESSAGE);
    }
  };

  const logout = async () => {
    try {
      await post(ApiPaths.auth.logout, {}).catch(() => {});
    } finally {
      clearTokens();

      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);

      window.location.href = '/login';
    }
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    startSession,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
