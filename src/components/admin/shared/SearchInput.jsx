import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SearchInput = ({ value, onChange, placeholder = 'Search...', className }) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
        style={{ fontFamily: 'var(--font-family-inter)' }}
      />
    </div>
  )
}

export default SearchInput
