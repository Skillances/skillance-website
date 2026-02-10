import { createContext, useContext, useState, useEffect } from 'react'
import { post, clearTokens, storeTokens } from '@/utils/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('accessToken')

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          setIsAdmin(userData.isAdmin === true)
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        // Clear corrupted data
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()
  }, [])

  const login = async (email, password) => {
    try {
      // Sanitize and validate input
      const sanitizedEmail = email.trim().toLowerCase()
      
      if (!sanitizedEmail || !password) {
        throw new Error('Email and password are required')
      }

      const response = await post('/auth/login', {
        email: sanitizedEmail,
        password, // Don't trim password - spaces may be intentional
      })

      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data

        // Store tokens in localStorage (for mobile app compatibility)
        // Cookies are set automatically by the backend (httpOnly, more secure)
        storeTokens(accessToken, refreshToken)
        
        // Store user data in localStorage (needed for frontend state)
        localStorage.setItem('user', JSON.stringify(userData))

        // Update state
        setUser(userData)
        setIsAuthenticated(true)
        setIsAdmin(userData.isAdmin === true)

        return { success: true, user: userData }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      // Preserve rate limiting errors
      if (error.retryAfter) {
        const rateLimitError = new Error(error.message || 'Too many login attempts')
        rateLimitError.retryAfter = error.retryAfter
        throw rateLimitError
      }
      
      // Handle API errors
      if (error.errors) {
        // Validation errors from backend
        const firstError = error.errors[0]
        throw new Error(firstError?.message || 'Validation failed')
      }
      
      // Don't reveal specific error details for security (prevent user enumeration)
      if (error.message?.includes('Invalid email or password') || 
          error.message?.includes('Invalid credentials') ||
          error.message?.includes('User not found')) {
        throw new Error('Invalid email or password')
      }
      
      throw new Error(error.message || 'Login failed. Please try again.')
    }
  }

  const logout = async () => {
    try {
      // Call backend logout to clear httpOnly cookies
      // This will fail silently if already logged out or network error
      await post('/auth/logout', {}).catch(() => {
        // Ignore errors - cookies may already be cleared
      })
    } catch (error) {
      // Ignore logout errors
    } finally {
      // Clear tokens and user data from localStorage
      clearTokens()
      localStorage.removeItem('user')

      // Reset state
      setUser(null)
      setIsAuthenticated(false)
      setIsAdmin(false)

      // Redirect to login (using window.location to avoid Router context issues)
      window.location.href = '/login'
    }
  }

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

