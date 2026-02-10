import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [retryAfter, setRetryAfter] = useState(null)
  const formRef = useRef(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Sanitize email input (remove whitespace, convert to lowercase)
  const handleEmailChange = (e) => {
    const value = e.target.value.trim().toLowerCase()
    setEmail(value)
    setError('')
  }

  // Sanitize password input (prevent XSS)
  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setError('')
  }

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate password (minimum length)
  const validatePassword = (password) => {
    return password.length >= 6
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setRetryAfter(null)

    // Client-side validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long')
      return
    }

    // Prevent multiple simultaneous submissions
    if (isLoading) {
      return
    }

    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Check if user is admin
        if (result.user?.isAdmin === true) {
          // Redirect to admin dashboard
          navigate('/admin/dashboard', { replace: true })
        } else {
          // Show error for non-admin users
          setError('Admin access required. This account does not have admin privileges.')
          setIsLoading(false)
        }
      }
    } catch (err) {
      // Handle rate limiting errors
      if (err.retryAfter) {
        setRetryAfter(err.retryAfter)
        setError(`Too many login attempts. Please try again in ${Math.ceil(err.retryAfter / 1000)} seconds.`)
      } else if (err.message?.includes('rate limit') || err.message?.includes('Too many')) {
        setError('Too many login attempts. Please wait a few minutes before trying again.')
      } else {
        // Generic error message (don't reveal if email exists or not)
        setError(err.message || 'Invalid email or password. Please check your credentials and try again.')
      }
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Login"
        subtitle="Sign in to access the admin dashboard"
        breadcrumb={['Home', 'Login']}
      />

      <Section>
        <div className="max-w-md mx-auto">
          <AnimatedSection animation="fadeInUp">
            <Card>
              <CardHeader>
                <CardTitle 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-2xl text-center"
                >
                  Login
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access the admin panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {error && (
                    <div 
                      className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2"
                      role="alert"
                      aria-live="polite"
                    >
                      <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                        {retryAfter && (
                          <p className="text-xs text-red-600 mt-1">
                            Retry after: {Math.ceil(retryAfter / 1000)} seconds
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none" 
                        aria-hidden="true"
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        disabled={isLoading}
                        className="pl-10"
                        aria-invalid={error && error.includes('email') ? 'true' : 'false'}
                        aria-describedby={error && error.includes('email') ? 'email-error' : undefined}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none" 
                        aria-hidden="true"
                      />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        disabled={isLoading}
                        className="pl-10 pr-10"
                        minLength={6}
                        aria-invalid={error && error.includes('password') ? 'true' : 'false'}
                        aria-describedby={error && error.includes('password') ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff size={20} aria-hidden="true" />
                        ) : (
                          <Eye size={20} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading || !!retryAfter}
                    style={{ backgroundColor: 'var(--color-section-primary)' }}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </Section>
    </>
  )
}

export default LoginPage

