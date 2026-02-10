import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const FilterDropdown = ({ label, value, onChange, options = [] }) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-slate-500 ml-1">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white border-slate-200">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default FilterDropdown
