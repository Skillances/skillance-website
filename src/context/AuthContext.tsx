import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { post, clearTokens, storeTokens } from '@/lib/api';

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
  login: (email: string, password: string) => Promise<{ success: boolean; user: User }>;
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
    const loadAuthState = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsAdmin(userData.isAdmin === true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      
      if (!sanitizedEmail || !password) {
        throw new Error('Email and password are required');
      }

      const response = await post('/auth/login', {
        email: sanitizedEmail,
        password,
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
      await post('/auth/logout', {}).catch(() => {});
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
