import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MapPin, X } from 'lucide-react';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { cn } from '@/lib/utils';

/** An address chosen from suggestions or geocoded from typed text. Coordinates only when the API returned them. */
export type PlacePick = {
  address: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

type Suggestion = {
  id?: string;
  name?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
};

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/**
 * Address search backed by `POST /geocoding/places/autocomplete` and `POST /geocoding/geocode`
 * (public, rate limited to 30 per minute, so input is debounced).
 */
export default function PlaceAddressField({
  label,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  value: PlacePick | null;
  onChange: (v: PlacePick | null) => void;
  hint?: string;
  error?: string | null;
}) {
  const id = useId();
  const [text, setText] = useState(value?.address ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [resolving, setResolving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const debounced = useDebouncedValue(text.trim(), 350);
  const enabled = open && debounced.length >= 3 && debounced !== value?.address;

  const suggestions = useQuery({
    queryKey: ['marketplace', 'places', debounced],
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
    queryFn: async () => {
      const res = await post(ApiPaths.marketplace.placeAutocomplete, { query: debounced });
      return (Array.isArray(res?.data) ? res.data : []) as Suggestion[];
    },
  });
  const items = enabled ? (suggestions.data ?? []) : [];

  const pick = async (s: Suggestion) => {
    const address = s.address || s.name || '';
    setOpen(false);
    setText(address);
    setLocalError(null);
    const lat = num(s.latitude);
    const lng = num(s.longitude);
    if (lat != null && lng != null) {
      onChange({ address, city: s.city, latitude: lat, longitude: lng });
      return;
    }
    await geocode(address);
  };

  const geocode = async (address: string) => {
    if (!address.trim()) return;
    setResolving(true);
    try {
      const res = await post(ApiPaths.marketplace.geocode, { address: address.trim() });
      const d = (res?.data ?? {}) as Record<string, unknown>;
      const formatted = typeof d.formattedAddress === 'string' && d.formattedAddress ? d.formattedAddress : address.trim();
      setText(formatted);
      onChange({
        address: formatted,
        city: typeof d.city === 'string' ? d.city : undefined,
        latitude: num(d.latitude),
        longitude: num(d.longitude),
      });
    } catch (err) {
      setLocalError(apiErrorMessage(err, 'We could not find that address. Try adding the suburb and city.'));
      onChange(null);
    } finally {
      setResolving(false);
    }
  };

  const shownError = error ?? localError;
  const listId = `${id}-list`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-mk-display text-[13px] font-semibold">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mk-text-tertiary" aria-hidden="true" />
        <input
          id={id}
          role="combobox"
          aria-expanded={open && items.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
          aria-invalid={shownError ? true : undefined}
          autoComplete="street-address"
          value={text}
          placeholder="Start typing an address"
          onChange={(e) => {
            setText(e.target.value);
            setActive(-1);
            setOpen(true);
            setLocalError(null);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === 'Enter') {
              if (open && active >= 0 && items[active]) {
                e.preventDefault();
                void pick(items[active]);
              } else if (!value && text.trim()) {
                e.preventDefault();
                setOpen(false);
                void geocode(text);
              }
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className={cn(
            'h-12 w-full rounded-xl border border-transparent bg-mk-muted pl-11 pr-11 text-[15px] placeholder:text-mk-text-tertiary',
            'transition-[border-color,background-color] duration-150 focus:border-mk-primary focus:bg-mk-surface focus:outline-none',
            shownError && 'border-mk-error',
          )}
        />
        {(resolving || suggestions.isFetching) && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mk-text-tertiary" aria-hidden="true" />
        )}
        {!resolving && !suggestions.isFetching && text && (
          <button
            type="button"
            aria-label="Clear address"
            onClick={() => {
              setText('');
              onChange(null);
              setLocalError(null);
            }}
            className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-mk-text-tertiary hover:text-mk-text-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        {open && items.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute inset-x-0 top-[52px] z-20 max-h-64 overflow-y-auto rounded-xl border border-mk-border bg-mk-surface py-1 shadow-mk-card"
          >
            {items.map((s, i) => (
              <li
                key={s.id ?? `${s.address}-${i}`}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void pick(s)}
                className={cn(
                  'flex min-h-11 cursor-pointer flex-col justify-center px-4 py-2 text-[14px]',
                  i === active ? 'bg-mk-muted' : 'hover:bg-mk-muted',
                )}
              >
                <span className="font-semibold text-mk-text-primary">{s.name || s.address}</span>
                {s.address && s.name && s.address !== s.name && (
                  <span className="text-[13px] text-mk-text-secondary">{s.address}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {!value && text.trim().length >= 3 && !open && !resolving && !shownError && (
        <button
          type="button"
          onClick={() => void geocode(text)}
          className="inline-flex min-h-11 items-center text-[13px] font-semibold text-mk-text-primary underline underline-offset-2"
        >
          Use this address
        </button>
      )}
      {shownError ? (
        <p role="alert" className="text-[13px] text-mk-error">
          {shownError}
        </p>
      ) : value ? (
        <p className="text-[13px] text-mk-success">Address set{value.latitude == null ? ' (without map position)' : ''}</p>
      ) : hint ? (
        <p className="text-[13px] text-mk-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}
