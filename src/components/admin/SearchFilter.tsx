import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-600 dark:focus-visible:border-neutral-500 h-10 rounded-xl transition-all duration-200"
        />
      </div>
      {filters.map((filter) => (
        <Select key={filter.key} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-200 h-10 rounded-xl hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-xl shadow-soft-lg">
            {filter.options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-neutral-600 dark:text-neutral-300 focus:bg-neutral-50 dark:focus:bg-neutral-700 focus:text-black dark:focus:text-white rounded-lg"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};

export default SearchFilter;
