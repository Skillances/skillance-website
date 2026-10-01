import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mkMotion } from '@/lib/marketplace/theme';
import { fileToDataUrl } from '@/lib/marketplace/apiHelpers';
import { PASSWORD_RULES, validateImageFile } from '@/lib/marketplace/validation';
import type { CategoryLeaf } from '@/lib/marketplace/categories';
import { MkAvatar, MkInput, MkSkeleton } from '@/components/marketplace/ui';

/** Optional square photo picker that hands back a `data:image/...;base64,` string. */
export function MkPhotoPicker({
  value,
  onChange,
  label = 'Profile photo',
  name,
  error,
}: {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  name?: string;
  error?: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const shown = error ?? localError;

  return (
    <div className="flex items-center gap-4">
      <MkAvatar src={value} name={name} size={72} />
      <div className="min-w-0 flex-1">
        <p className="font-mk-display text-[13px] font-semibold">
          {label} <span className="font-normal text-mk-text-tertiary">(optional)</span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-mk-border px-3.5 font-mk-display text-[13px] font-semibold transition-colors duration-150 hover:bg-mk-muted"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {value ? 'Change photo' : 'Add photo'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex min-h-11 items-center rounded-xl px-3 font-mk-display text-[13px] font-semibold text-mk-text-secondary transition-colors duration-150 hover:bg-mk-muted"
            >
              Remove
            </button>
          )}
        </div>
        {shown && (
          <p role="alert" className="mt-1.5 text-[13px] text-mk-error">
            {shown}
          </p>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          const problem = validateImageFile(file);
          setLocalError(problem);
          if (problem) return;
          try {
            onChange(await fileToDataUrl(file));
          } catch {
            setLocalError('Could not read that image.');
          }
        }}
      />
    </div>
  );
}

/** Live checklist under a password field. Green marks a met rule (accent = positive state). */
export function MkPasswordRules({ value }: { value: string }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1" aria-label="Password requirements">
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(value);
        return (
          <li
            key={r.id}
            className={cn(
              'flex items-center gap-1.5 text-[12px] transition-colors duration-150',
              ok ? 'text-mk-text-primary' : 'text-mk-text-tertiary',
            )}
          >
            <span
              className={cn(
                'inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors duration-150',
                ok ? 'bg-mk-accent text-mk-on-primary' : 'bg-mk-muted',
              )}
              aria-hidden="true"
            >
              {ok && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            {r.label}
            <span className="sr-only">{ok ? '(met)' : '(not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Leaf category multi-select with a rate field for each selection, like the app's registration
 * category step. `rates` maps category path to the typed ZAR value.
 */
export function MkCategoryRatePicker({
  leaves,
  loading,
  selected,
  onSelectedChange,
  rates,
  onRatesChange,
  rateErrors,
  error,
  maxSelected,
}: {
  leaves: CategoryLeaf[];
  loading?: boolean;
  selected: string[];
  onSelectedChange: (paths: string[]) => void;
  rates: Record<string, string>;
  onRatesChange: (rates: Record<string, string>) => void;
  rateErrors?: Record<string, string | undefined>;
  error?: string | null;
  maxSelected?: number;
}) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return leaves;
    return leaves.filter((l) => l.breadcrumb.join(' ').toLowerCase().includes(t));
  }, [leaves, q]);

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; items: CategoryLeaf[] }>();
    for (const l of filtered) {
      const g = map.get(l.rootId) ?? { name: l.rootName, items: [] };
      g.items.push(l);
      map.set(l.rootId, g);
    }
    return [...map.entries()];
  }, [filtered]);

  const byPath = useMemo(() => new Map(leaves.map((l) => [l.path, l])), [leaves]);
  const atLimit = maxSelected != null && selected.length >= maxSelected;

  const toggle = (path: string) => {
    if (selected.includes(path)) {
      onSelectedChange(selected.filter((p) => p !== path));
      const next = { ...rates };
      delete next[path];
      onRatesChange(next);
    } else if (!atLimit) {
      onSelectedChange([...selected, path]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mk-text-tertiary" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services"
          aria-label="Search service categories"
          className="h-12 w-full rounded-xl border border-transparent bg-mk-muted pl-11 pr-4 text-[15px] placeholder:text-mk-text-tertiary focus:border-mk-primary focus:bg-mk-surface focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          <MkSkeleton className="h-10 w-full" />
          <MkSkeleton className="h-10 w-4/5" />
          <MkSkeleton className="h-10 w-3/5" />
        </div>
      ) : (
        <div className="mk-scroll max-h-72 space-y-4 rounded-2xl border border-mk-border p-3" data-lenis-prevent>
          {groups.length === 0 && <p className="py-6 text-center text-[14px] text-mk-text-secondary">No services match that search.</p>}
          {groups.map(([rootId, g]) => (
            <fieldset key={rootId}>
              <legend className="mb-2 font-mk-display text-[12px] font-semibold uppercase tracking-[0.08em] text-mk-text-tertiary">
                {g.name}
              </legend>
              <div className="flex flex-wrap gap-2">
                {g.items.map((l) => {
                  const on = selected.includes(l.path);
                  const label = l.breadcrumb.slice(1).join(' / ') || l.name;
                  return (
                    <button
                      key={l.path}
                      type="button"
                      aria-pressed={on}
                      disabled={!on && atLimit}
                      onClick={() => toggle(l.path)}
                      className={cn(
                        'inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 text-[14px] transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-40',
                        on
                          ? 'border-mk-primary bg-mk-primary text-mk-on-primary'
                          : 'border-mk-border bg-mk-surface text-mk-text-primary hover:bg-mk-muted',
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-[13px] text-mk-error">
          {error}
        </p>
      )}

      <AnimatePresence initial={false}>
        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mkMotion.control }}
            className="space-y-3"
          >
            <p className="font-mk-display text-[13px] font-semibold">Hourly rate for each service (ZAR)</p>
            {selected.map((path) => {
              const leaf = byPath.get(path);
              const label = leaf ? leaf.breadcrumb.slice(1).join(' / ') || leaf.name : path;
              return (
                <div key={path} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <MkInput
                      label={label}
                      inputMode="decimal"
                      placeholder="e.g. 350"
                      value={rates[path] ?? ''}
                      onChange={(e) => onRatesChange({ ...rates, [path]: e.target.value.replace(/[^0-9.]/g, '') })}
                      error={rateErrors?.[path]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(path)}
                    aria-label={`Remove ${label}`}
                    className="mt-[26px] inline-flex h-12 w-11 shrink-0 items-center justify-center rounded-xl text-mk-text-tertiary transition-colors duration-150 hover:bg-mk-muted hover:text-mk-text-primary"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
