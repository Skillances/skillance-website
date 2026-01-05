import { Inbox } from 'lucide-react'

const EmptyState = ({ 
  title = 'No items found', 
  message = 'There are no items to display at this time.',
  icon: Icon = Inbox,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Icon className="h-12 w-12 text-text-tertiary mb-4" />
      <h3 
        className="text-lg font-semibold text-text-primary mb-2"
        style={{ fontFamily: 'var(--font-family-poppins)' }}
      >
        {title}
      </h3>
      <p 
        className="text-text-tertiary text-center max-w-md"
        style={{ fontFamily: 'var(--font-family-inter)' }}
      >
        {message}
      </p>
    </div>
  )
}

export default EmptyState

