import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { post, get, clearTokens, storeTokens } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

interface User {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
}

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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadAuthState = async () => {
      const storedToken = localStorage.getItem('accessToken');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await get(ApiPaths.users.me);
        if (cancelled) return;

        if (response?.success && response?.data?.user) {
          const { user: userData } = response.data;
          const authUser: User = {
            id: userData.id,
            fullName: userData.fullName ?? '',
            email: userData.email ?? '',
            isAdmin: userData.isAdmin === true,
          };
          setUser(authUser);
          setIsAuthenticated(true);
          setIsAdmin(authUser.isAdmin);
          localStorage.setItem('user', JSON.stringify(authUser));
        }
      } catch (error) {
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
  }, []);

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
        const { user: userData, accessToken, refreshToken } = response.data;

        storeTokens(accessToken, refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.isAdmin === true);

        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      if (error.retryAfter) {
        const rateLimitError: any = new Error(error.message || 'Too many login attempts');
        rateLimitError.retryAfter = error.retryAfter;
        throw rateLimitError;
      }
      
      if (error.errors) {
        const firstError = error.errors[0];
        throw new Error(firstError?.message || 'Validation failed');
      }
      
      if (error.message?.includes('Invalid email or password') || 
          error.message?.includes('Invalid credentials') ||
          error.message?.includes('User not found')) {
        throw new Error('Invalid email or password');
      }
      
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await post(ApiPaths.auth.logout, {}).catch(() => {});
    } catch (error) {
    } finally {
      clearTokens();
      localStorage.removeItem('user');

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
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
