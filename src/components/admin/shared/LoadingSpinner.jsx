import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mb-4" />
      <p className="text-slate-500 animate-pulse">{message}</p>
    </div>
  )
}

export default LoadingSpinner
