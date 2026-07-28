import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { post, get, clearTokens, storeTokens } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import type { AppUser, PreferredView } from '@/types/product';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  preferredView: PreferredView;
  isFreelancerView: boolean;
  refreshUser: () => Promise<void>;
  login: (
    email: string,
    password: string,
    options?: { rememberMe?: boolean },
  ) => Promise<{ success: boolean; user: AppUser }>;
  loginWithGoogleIdToken: (idToken: string) => Promise<{ success: boolean; user: AppUser }>;
  registerCustomer: (payload: Record<string, unknown>) => Promise<{ success: boolean; user: AppUser }>;
  registerFreelancer: (payload: Record<string, unknown>) => Promise<{ success: boolean; user: AppUser }>;
  setPreferredView: (view: PreferredView) => Promise<void>;
  logout: (options?: { redirectTo?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(userData: Record<string, unknown>): AppUser {
  const staff =
    userData.isAdmin === true || String(userData.primaryRole).toLowerCase() === 'admin';
  const preferredView =
    (userData.preferredView as PreferredView | undefined) ??
    (userData.primaryRole === 'freelancer' ? 'freelancer' : 'customer');

  return {
    id: String(userData.id ?? ''),
    fullName: String(userData.fullName ?? userData.full_name ?? ''),
    email: String(userData.email ?? ''),
    isAdmin: staff,
    primaryRole: userData.primaryRole ? String(userData.primaryRole) : undefined,
    preferredView,
    customerId: (userData.customerId as string | null | undefined) ?? null,
    freelancerId: (userData.freelancerId as string | null | undefined) ?? null,
    phoneNumber: (userData.phoneNumber as string | null | undefined) ?? null,
    profilePhotoUrl: (userData.profilePhotoUrl as string | null | undefined) ?? null,
  };
}

function applySession(
  userData: Record<string, unknown>,
  accessToken: string,
  refreshToken: string,
  setUser: (u: AppUser) => void,
  setIsAuthenticated: (v: boolean) => void,
  setIsAdmin: (v: boolean) => void,
): AppUser {
  storeTokens(accessToken, refreshToken);
  const authUser = normalizeUser(userData);
  localStorage.setItem('user', JSON.stringify(authUser));
  setUser(authUser);
  setIsAuthenticated(true);
  setIsAdmin(authUser.isAdmin);
  return authUser;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const response = await get(ApiPaths.users.me);
    if (response?.success && response?.data?.user) {
      const authUser = normalizeUser(response.data.user);
      setUser(authUser);
      setIsAuthenticated(true);
      setIsAdmin(authUser.isAdmin);
      localStorage.setItem('user', JSON.stringify(authUser));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      const storedToken = localStorage.getItem('accessToken');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
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
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string,
    options?: { rememberMe?: boolean },
  ) => {
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail || !password) {
      throw new Error('Email and password are required');
    }

    const response = await post(ApiPaths.auth.login, {
      email: sanitizedEmail,
      password,
      rememberMe: options?.rememberMe === true,
    });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    const { user: userData, accessToken, refreshToken } = response.data;
    const authUser = applySession(
      userData,
      accessToken,
      refreshToken,
      setUser,
      setIsAuthenticated,
      setIsAdmin,
    );
    return { success: true, user: authUser };
  };

  const loginWithGoogleIdToken = async (idToken: string) => {
    const response = await post(ApiPaths.auth.google, { idToken });
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Google sign-in failed');
    }
    const { user: userData, accessToken, refreshToken } = response.data;
    const authUser = applySession(
      userData,
      accessToken,
      refreshToken,
      setUser,
      setIsAuthenticated,
      setIsAdmin,
    );
    return { success: true, user: authUser };
  };

  const registerCustomer = async (payload: Record<string, unknown>) => {
    const response = await post(ApiPaths.auth.registerCustomer, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    const { user: userData, accessToken, refreshToken } = response.data;
    const authUser = applySession(
      userData,
      accessToken,
      refreshToken,
      setUser,
      setIsAuthenticated,
      setIsAdmin,
    );
    return { success: true, user: authUser };
  };

  const registerFreelancer = async (payload: Record<string, unknown>) => {
    const response = await post(ApiPaths.auth.registerFreelancer, payload);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }
    const { user: userData, accessToken, refreshToken } = response.data;
    const authUser = applySession(
      userData,
      accessToken,
      refreshToken,
      setUser,
      setIsAuthenticated,
      setIsAdmin,
    );
    return { success: true, user: authUser };
  };

  const setPreferredView = async (view: PreferredView) => {
    await post(ApiPaths.users.preferredView, { preferredView: view });
    await refreshUser();
  };

  const logout = async (options?: { redirectTo?: string }) => {
    const redirectTo =
      options?.redirectTo ?? (user?.isAdmin ? '/login' : '/app/login');
    try {
      await post(ApiPaths.auth.logout, {}).catch(() => {});
    } finally {
      clearTokens();
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      window.location.href = redirectTo;
    }
  };

  const preferredView: PreferredView =
    user?.preferredView ?? (user?.freelancerId ? 'freelancer' : 'customer');
  const isFreelancerView = preferredView === 'freelancer' && Boolean(user?.freelancerId);

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    preferredView,
    isFreelancerView,
    refreshUser,
    login,
    loginWithGoogleIdToken,
    registerCustomer,
    registerFreelancer,
    setPreferredView,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
