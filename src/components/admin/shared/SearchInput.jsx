import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={18} />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        style={{ fontFamily: 'var(--font-family-inter)' }}
      />
    </div>
  )
}

export default SearchInput

