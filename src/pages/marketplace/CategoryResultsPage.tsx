import { useParams } from 'react-router-dom';
import { useState } from 'react';
import FreelancerResults from '@/components/marketplace/FreelancerResults';
import NearYouToggle from '@/components/marketplace/NearYouToggle';
import { MkLinkButton, MkPageHeader, MkSkeleton } from '@/components/marketplace/ui';
import { useCategories, type CategoryNode } from '@/lib/marketplace/categories';
import { useBrowserLocation } from '@/lib/marketplace/search';
import { cn } from '@/lib/utils';

/** Finds a node by id anywhere in the tree and returns it with its colon path. */
function findWithPath(roots: CategoryNode[], id: string): { node: CategoryNode; path: string } | null {
  const walk = (nodes: CategoryNode[], prefix: string[]): { node: CategoryNode; path: string } | null => {
    for (const n of nodes) {
      const ids = [...prefix, n.id];
      if (n.id === id || ids.join(':') === id) return { node: n, path: ids.join(':') };
      const hit = walk(n.children ?? [], ids);
      if (hit) return hit;
    }
    return null;
  };
  return walk(roots, []);
}

const NEARBY_KM = 50;

/** Freelancer results for one category (search filtered by category id). Not the marketing category page. */
export default function CategoryResultsPage() {
  const { categoryId = '' } = useParams();
  const categories = useCategories();
  const loc = useBrowserLocation();
  const [sub, setSub] = useState<string | null>(null);

  const found = categories.data ? findWithPath(categories.data, categoryId) : null;
  const basePath = found?.path ?? categoryId;
  const filterPath = sub ?? basePath;
  const children = found?.node.children ?? [];

  return (
    <>
      <MkPageHeader
        back
        title={found?.node.name ?? (categories.isPending ? <MkSkeleton className="h-7 w-40" /> : 'Category')}
        subtitle={found?.node.description || 'Freelancers offering this service.'}
      />

      {children.length > 0 && (
        <div className="-mx-4 mb-4 overflow-x-auto px-4 [scrollbar-width:none]">
          <div className="flex gap-2 pb-1">
            {[{ id: '', name: 'All' }, ...children].map((c) => {
              const value = c.id ? `${basePath}:${c.id}` : null;
              const on = sub === value;
              return (
                <button
                  key={c.id || 'all'}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSub(value)}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 font-mk-display text-[13px] font-semibold transition-colors duration-150',
                    on ? 'border-mk-primary bg-mk-primary text-mk-on-primary' : 'border-mk-border hover:bg-mk-muted',
                  )}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-5">
        <NearYouToggle />
      </div>

      <FreelancerResults
        body={{
          query: '',
          filters: {
            categoryIds: [filterPath],
            ...(loc.status === 'granted' ? { maxDistance: NEARBY_KM } : {}),
          },
          ...(loc.status === 'granted'
            ? { location: { latitude: loc.latitude, longitude: loc.longitude }, sortBy: 'distance' as const }
            : { sortBy: 'rating' as const }),
        }}
        emptyTitle="No freelancers in this category yet"
        emptyBody="Try a related service, or search for what you need."
        emptyAction={<MkLinkButton to="/search" variant="secondary">Search all services</MkLinkButton>}
      />
    </>
  );
}
