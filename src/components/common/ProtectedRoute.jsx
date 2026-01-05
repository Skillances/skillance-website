import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-family-poppins)' }}>
            Access Denied
          </h1>
          <p className="text-text-secondary mb-6">
            You do not have permission to access this page. Admin privileges are required.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-md text-white font-medium"
            style={{ backgroundColor: 'var(--color-section-primary)' }}
          >
            Return to Home
          </a>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute

