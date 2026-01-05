import { ChevronDown } from 'lucide-react'

const FilterDropdown = ({ label, value, onChange, options, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-text-secondary" style={{ fontFamily: 'var(--font-family-inter)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-white text-text-primary appearance-none cursor-pointer hover:border-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          style={{ fontFamily: 'var(--font-family-inter)' }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary pointer-events-none" size={18} />
      </div>
    </div>
  )
}

export default FilterDropdown

