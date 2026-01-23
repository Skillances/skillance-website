import { SearchX } from 'lucide-react'

const EmptyState = ({ title = 'No results found', message = 'Try adjusting your filters or search terms.' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <SearchX size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 max-w-sm">{message}</p>
    </div>
  )
}

export default EmptyState
