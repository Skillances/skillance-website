import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-variant">
      <div className="text-center px-4">
        <h1 style={{ fontFamily: 'var(--font-family-poppins)', fontSize: '120px', color: 'var(--color-text-tertiary)' }} className="font-bold mb-4">
          404
        </h1>
        <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl font-bold mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button size="lg" asChild>
          <Link to="/">
            <Home className="mr-2" size={20} />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
