import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { post, get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { FreelancerCard } from '@/components/app/FreelancerCard';
import type { CategoryNode, FreelancerSummary } from '@/types/product';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
  const out: CategoryNode[] = [];
  const walk = (list: CategoryNode[]) => {
    for (const n of list) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

interface SearchFilters {
  minRating: string;
  minPrice: string;
  maxPrice: string;
  maxDistance: string;
  sortBy: 'relevance' | 'distance' | 'rating' | 'price';
  sortOrder: 'asc' | 'desc';
}

const DEFAULT_FILTERS: SearchFilters = {
  minRating: '',
  minPrice: '',
  maxPrice: '',
  maxDistance: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  const { data: results = [], isFetching } = useQuery({
    queryKey: queryKeys.freelancers.search({
      query: submitted,
      filters: appliedFilters,
    }),
    queryFn: async () => {
      if (!submitted.trim()) return [];

      const body: Record<string, unknown> = {
        query: submitted.trim(),
        pagination: { limit: 30 },
        sortBy: appliedFilters.sortBy,
        sortOrder: appliedFilters.sortOrder,
      };

      const filterPayload: Record<string, unknown> = {};
      if (appliedFilters.minRating) {
        filterPayload.minRating = parseFloat(appliedFilters.minRating);
      }
      if (appliedFilters.minPrice || appliedFilters.maxPrice) {
        filterPayload.priceRange = {
          ...(appliedFilters.minPrice ? { min: parseFloat(appliedFilters.minPrice) } : {}),
          ...(appliedFilters.maxPrice ? { max: parseFloat(appliedFilters.maxPrice) } : {}),
        };
      }
      if (appliedFilters.maxDistance) {
        filterPayload.maxDistance = parseFloat(appliedFilters.maxDistance);
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                maximumAge: 600_000,
              });
            });
            body.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
          } catch {
            // Distance filter ignored without location permission
          }
        }
      }
      if (Object.keys(filterPayload).length > 0) {
        body.filters = filterPayload;
      }

      const res = await post(ApiPaths.freelancers.search, body);
      const data = res?.data?.freelancers ?? res?.data?.results ?? res?.data ?? [];
      return Array.isArray(data) ? (data as FreelancerSummary[]) : [];
    },
    enabled: submitted.trim().length > 0,
  });

  const flat = flattenCategories(categories);

  const runSearch = () => {
    setSubmitted(query.trim());
    setAppliedFilters(filters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Search</h1>
        <p className="text-neutral-600 text-sm mt-1">Find freelancers by skill, name, or category</p>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. plumber, electrician..."
            className="pl-9 rounded-full"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full shrink-0 px-3"
          onClick={() => setShowFilters((v) => !v)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <Button type="submit" className="rounded-full shrink-0">
          Search
        </Button>
      </form>

      {showFilters ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Min rating</Label>
            <Input
              type="number"
              min={0}
              max={5}
              step={0.5}
              placeholder="e.g. 4"
              value={filters.minRating}
              onChange={(e) => setFilters((f) => ({ ...f, minRating: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max distance (km)</Label>
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="Uses your location if allowed"
              value={filters.maxDistance}
              onChange={(e) => setFilters((f) => ({ ...f, maxDistance: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Min hourly rate (ZAR)</Label>
            <Input
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Max hourly rate (ZAR)</Label>
            <Input
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sort by</Label>
            <select
              className="w-full h-10 rounded-md border border-neutral-200 px-3 text-sm"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  sortBy: e.target.value as SearchFilters['sortBy'],
                }))
              }
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
              <option value="distance">Distance</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Sort order</Label>
            <select
              className="w-full h-10 rounded-md border border-neutral-200 px-3 text-sm"
              value={filters.sortOrder}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  sortOrder: e.target.value as SearchFilters['sortOrder'],
                }))
              }
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="button" className="rounded-full" onClick={runSearch}>
              Apply filters
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
                setAppliedFilters(DEFAULT_FILTERS);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      ) : null}

      {!submitted && flat.length > 0 ? (
        <div>
          <p className="text-sm font-medium text-neutral-700 mb-2">Browse by category</p>
          <div className="flex flex-wrap gap-2">
            {flat.slice(0, 12).map((c) => (
              <Link
                key={c.id}
                to={`/app/category/${c.id}`}
                className="text-sm px-3 py-1.5 rounded-full border border-neutral-200 bg-white hover:border-neutral-400"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {submitted && isFetching ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : null}

      {submitted && !isFetching && results.length === 0 ? (
        <p className="text-neutral-500 text-sm">No results for &ldquo;{submitted}&rdquo;</p>
      ) : null}

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((f) => (
            <FreelancerCard key={f.id} freelancer={f} showDistance />
          ))}
        </div>
      ) : null}
    </div>
  );
}
