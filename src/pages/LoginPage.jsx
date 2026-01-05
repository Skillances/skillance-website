import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      
      console.log('LoginPage - Login result:', result)
      console.log('LoginPage - result.user:', result.user)
      console.log('LoginPage - result.user.isAdmin:', result.user?.isAdmin, 'Type:', typeof result.user?.isAdmin)
      
      if (result.success) {
        // Check if user is admin
        if (result.user?.isAdmin === true) {
          console.log('LoginPage - Admin detected, redirecting to dashboard')
          // Redirect to admin dashboard
          navigate('/admin/dashboard')
        } else {
          console.log('LoginPage - Not admin, showing error')
          // Show error for non-admin users
          setError('Admin access required. This account does not have admin privileges.')
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials and try again.')
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
                      <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" 
                      />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock 
                        size={20} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" 
                      />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading}
                    style={{ backgroundColor: 'var(--color-section-primary)' }}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
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

