import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import SearchBar from '@/components/marketplace/SearchBar';
import NearYouToggle from '@/components/marketplace/NearYouToggle';
import FreelancerResults from '@/components/marketplace/FreelancerResults';
import { MkButton, MkDialog, MkInput, MkPageHeader, MkSelect } from '@/components/marketplace/ui';
import { categoryLabel, useCategories, type CategoryNode } from '@/lib/marketplace/categories';
import { useBrowserLocation, type SearchBody } from '@/lib/marketplace/search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/** Wait until typing pauses before hitting POST /freelancers/search. */
const SEARCH_DEBOUNCE_MS = 400;

/** Open upper bound when only a minimum rate is given (the API needs both ends). */
const PRICE_CEILING = 100_000;

type Filters = { cat: string; rating: string; min: string; max: string; dist: string };

function readFilters(p: URLSearchParams): Filters {
  return {
    cat: p.get('cat') ?? '',
    rating: p.get('rating') ?? '',
    min: p.get('min') ?? '',
    max: p.get('max') ?? '',
    dist: p.get('dist') ?? '',
  };
}

function categoryOptionNodes(roots: CategoryNode[]): ReactNode {
  return roots.map((r) =>
    r.children && r.children.length > 0 ? (
      <optgroup key={r.id} label={r.name}>
        <option value={r.id}>All {r.name}</option>
        {r.children.map((c) => (
          <option key={c.id} value={`${r.id}:${c.id}`}>
            {c.name}
          </option>
        ))}
      </optgroup>
    ) : (
      <option key={r.id} value={r.id}>
        {r.name}
      </option>
    ),
  );
}

function buildSearchBody(
  q: string,
  f: Filters,
  loc: ReturnType<typeof useBrowserLocation>,
): Omit<SearchBody, 'pagination'> {
  const filters: NonNullable<SearchBody['filters']> = {};
  if (f.cat) filters.categoryIds = [f.cat];
  const rating = Number(f.rating);
  if (f.rating && rating > 0 && rating <= 5) filters.minRating = rating;
  const min = Number(f.min);
  const max = Number(f.max);
  if ((f.min && Number.isFinite(min)) || (f.max && Number.isFinite(max))) {
    filters.priceRange = { min: f.min ? Math.max(0, min) : 0, max: f.max ? max : PRICE_CEILING };
  }
  const body: Omit<SearchBody, 'pagination'> = { query: q };
  if (loc.status === 'granted') {
    body.location = { latitude: loc.latitude, longitude: loc.longitude };
    const dist = Number(f.dist);
    if (f.dist && dist >= 1 && dist <= 100) filters.maxDistance = dist;
  }
  if (Object.keys(filters).length > 0) body.filters = filters;
  return body;
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const filters = readFilters(params);
  const loc = useBrowserLocation();
  const categories = useCategories();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const [draftError, setDraftError] = useState<string | null>(null);

  // React Query hashes the key by value, so a fresh object per render is fine.
  const body = buildSearchBody(q, filters, loc);
  const activeCount = [filters.cat, filters.rating, filters.min || filters.max, loc.status === 'granted' ? filters.dist : ''].filter(Boolean).length;

  const [queryDraft, setQueryDraft] = useState(q);
  const [seenQ, setSeenQ] = useState(q);
  if (q !== seenQ) {
    setSeenQ(q);
    if (queryDraft.trim() !== q) setQueryDraft(q);
  }
  const debouncedQuery = useDebouncedValue(queryDraft, SEARCH_DEBOUNCE_MS);

  const update = (next: Partial<Filters> & { q?: string }, replace = false) => {
    const merged = { q, ...filters, ...next };
    const out = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) out.set(k, v);
    setParams(out, { replace });
  };

  useEffect(() => {
    const next = debouncedQuery.trim();
    // Skip a stale debounce after the URL changes from outside, such as back or forward.
    if (next !== queryDraft.trim() || next === q) return;
    setParams(
      (prev) => {
        const out = new URLSearchParams(prev);
        if (next) out.set('q', next);
        else out.delete('q');
        return out;
      },
      { replace: true },
    );
  }, [debouncedQuery, queryDraft, q, setParams]);

  const applyDraft = () => {
    const min = draft.min ? Number(draft.min) : null;
    const max = draft.max ? Number(draft.max) : null;
    if (min != null && max != null && min > max) {
      setDraftError('Minimum rate must be lower than the maximum.');
      return;
    }
    setDraftError(null);
    update(draft);
    setOpen(false);
  };

  return (
    <>
      <MkPageHeader title="Search" subtitle={q ? `Results for "${q}"` : 'Find a freelancer for any job.'} />
      <div className="space-y-3">
        <SearchBar
          live
          value={queryDraft}
          onChange={setQueryDraft}
          onSubmit={(v) => update({ q: v }, true)}
          autoFocus={!q}
        />
        <div className="flex flex-wrap items-center gap-2">
          <MkButton
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => {
              setDraft(filters);
              setDraftError(null);
              setOpen(true);
            }}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </MkButton>
          <NearYouToggle />
          {filters.cat && (
            <button
              type="button"
              onClick={() => update({ cat: '' })}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-mk-muted px-3.5 text-[13px] font-semibold"
            >
              {categoryLabel(categories.data, filters.cat)}
              <X className="h-3.5 w-3.5" aria-label="Remove category filter" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <FreelancerResults
          body={body}
          emptyTitle={q ? `No results for "${q}"` : 'No freelancers found'}
          emptyBody={activeCount > 0 ? 'Remove a filter or two and try again.' : 'Try a different word, like "plumber" or "tutor".'}
          emptyAction={
            activeCount > 0 ? (
              <MkButton variant="secondary" onClick={() => update({ cat: '', rating: '', min: '', max: '', dist: '' })}>
                Clear filters
              </MkButton>
            ) : undefined
          }
        />
      </div>

      <MkDialog open={open} onOpenChange={setOpen} title="Filters">
        <div className="space-y-4">
          <MkSelect label="Category" value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })}>
            <option value="">All categories</option>
            {categoryOptionNodes(categories.data ?? [])}
          </MkSelect>
          <MkSelect label="Minimum rating" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: e.target.value })}>
            <option value="">Any rating</option>
            {[4.5, 4, 3, 2].map((r) => (
              <option key={r} value={String(r)}>
                {r} stars and up
              </option>
            ))}
          </MkSelect>
          <div className="grid grid-cols-2 gap-3">
            <MkInput
              label="Min rate (R/hour)"
              inputMode="decimal"
              value={draft.min}
              onChange={(e) => setDraft({ ...draft, min: e.target.value.replace(/[^0-9.]/g, '') })}
            />
            <MkInput
              label="Max rate (R/hour)"
              inputMode="decimal"
              value={draft.max}
              onChange={(e) => setDraft({ ...draft, max: e.target.value.replace(/[^0-9.]/g, '') })}
              error={draftError}
            />
          </div>
          {loc.status === 'granted' ? (
            <MkSelect label="Distance" value={draft.dist} onChange={(e) => setDraft({ ...draft, dist: e.target.value })}>
              <option value="">Any distance</option>
              {[5, 10, 25, 50, 100].map((d) => (
                <option key={d} value={String(d)}>
                  Within {d} km
                </option>
              ))}
            </MkSelect>
          ) : (
            <p className="text-[13px] text-mk-text-secondary">Turn on "Use my location" to filter by distance.</p>
          )}
          <div className="flex gap-2 pt-2">
            <MkButton
              variant="secondary"
              className="flex-1"
              onClick={() => setDraft({ cat: '', rating: '', min: '', max: '', dist: '' })}
            >
              Reset
            </MkButton>
            <MkButton className="flex-1" onClick={applyDraft}>
              Show results
            </MkButton>
          </div>
        </div>
      </MkDialog>
    </>
  );
}
