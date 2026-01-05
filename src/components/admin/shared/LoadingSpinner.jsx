import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin mb-4" style={{ color: 'var(--color-section-primary)' }} />
      <p className="text-text-tertiary" style={{ fontFamily: 'var(--font-family-inter)' }}>
        {message}
      </p>
    </div>
  )
}

export default LoadingSpinner

