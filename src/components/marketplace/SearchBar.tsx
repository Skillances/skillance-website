import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';

/** Muted search field (ThemeConfig.lightSurfaceVariant). Submits the trimmed query. */
export default function SearchBar({
  initial = '',
  onSubmit,
  placeholder = 'What do you need help with?',
  autoFocus,
}: {
  initial?: string;
  onSubmit: (q: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(value.trim());
  };
  return (
    <form role="search" onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mk-text-tertiary" aria-hidden="true" />
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search freelancers"
        maxLength={200}
        autoFocus={autoFocus}
        className="h-[52px] w-full rounded-2xl border border-transparent bg-mk-muted pl-12 pr-24 text-[16px] placeholder:text-mk-text-tertiary transition-[border-color,background-color] duration-150 focus:border-mk-primary focus:bg-mk-surface focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 inline-flex h-10 -translate-y-1/2 items-center rounded-xl bg-mk-primary px-4 font-mk-display text-[14px] font-semibold text-mk-on-primary transition-[background-color,transform] duration-150 hover:bg-mk-secondary active:scale-[0.97] motion-reduce:active:scale-100"
      >
        Search
      </button>
    </form>
  );
}
