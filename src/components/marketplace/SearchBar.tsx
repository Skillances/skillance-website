import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Muted search field (ThemeConfig.lightSurfaceVariant).
 * Default mode submits on Enter or the Search button.
 * Live mode reports every edit and hides the button; the parent waits out typing.
 */
export default function SearchBar({
  initial = '',
  value,
  onChange,
  onSubmit,
  placeholder = 'What do you need help with?',
  autoFocus,
  live = false,
}: {
  initial?: string;
  /** Controlled text. Live search uses this so the field survives URL updates. */
  value?: string;
  onChange?: (q: string) => void;
  onSubmit: (q: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  live?: boolean;
}) {
  const [uncontrolled, setUncontrolled] = useState(initial);
  const text = value ?? uncontrolled;
  const setText = (next: string) => {
    if (value === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(text.trim());
  };
  return (
    <form role="search" onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mk-text-tertiary" aria-hidden="true" />
      <input
        type="search"
        enterKeyHint="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label="Search freelancers"
        maxLength={200}
        autoFocus={autoFocus}
        className={cn(
          'h-[52px] w-full rounded-2xl border border-transparent bg-mk-muted pl-12 text-[16px] placeholder:text-mk-text-tertiary transition-[border-color,background-color] duration-150 focus:border-mk-primary focus:bg-mk-surface focus:outline-none',
          live ? 'pr-11' : 'pr-24',
        )}
      />
      {!live && (
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 inline-flex h-10 -translate-y-1/2 items-center rounded-xl bg-mk-primary px-4 font-mk-display text-[14px] font-semibold text-mk-on-primary transition-[background-color,transform] duration-150 hover:bg-mk-secondary active:scale-[0.97] motion-reduce:active:scale-100"
        >
          Search
        </button>
      )}
    </form>
  );
}
