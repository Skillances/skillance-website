import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight } from 'lucide-react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { FreelancerCard } from '@/components/app/FreelancerCard';
import type { CategoryNode, FreelancerSummary } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppHomePage() {
  const { data: featured = [], isPending: featuredLoading } = useQuery({
    queryKey: queryKeys.categories.featured(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.featured);
      return (res?.data ?? res ?? []) as CategoryNode[];
    },
  });

  const { data: freelancers = [], isPending: freelancersLoading } = useQuery({
    queryKey: queryKeys.freelancers.list({ limit: 8 }),
    queryFn: async () => {
      const res = await get(`${ApiPaths.freelancers.list}?limit=8`);
      const data = res?.data?.freelancers ?? res?.data ?? res?.freelancers ?? [];
      return Array.isArray(data) ? (data as FreelancerSummary[]) : [];
    },
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
          Find trusted local experts
        </h1>
        <p className="text-neutral-600 mt-2 max-w-lg">
          Browse verified freelancers, compare ratings, and book services near you.
        </p>
        <Link to="/app/search" className="inline-block mt-4">
          <Button className="rounded-full gap-2">
            <Search className="h-4 w-4" />
            Search freelancers
          </Button>
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Popular categories</h2>
          <Link to="/app/categories" className="text-sm text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {featuredLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featured.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/app/category/${cat.id}`}
                className="rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors"
              >
                <p className="font-medium text-neutral-900 text-sm">{cat.name}</p>
                {cat.description && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Featured freelancers</h2>
        {freelancersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : freelancers.length === 0 ? (
          <p className="text-neutral-500 text-sm">No freelancers to show yet. Try search or categories.</p>
        ) : (
          <div className="space-y-3">
            {freelancers.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
