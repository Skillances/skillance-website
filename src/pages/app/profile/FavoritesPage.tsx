import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { FreelancerCard } from '@/components/app/FreelancerCard';
import type { FreelancerSummary } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';

export default function FavoritesPage() {
  const { data: favorites = [], isPending } = useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: async () => {
      const res = await get(ApiPaths.favorites.list);
      const data = res?.data?.favorites ?? res?.data ?? [];
      return Array.isArray(data) ? (data as FreelancerSummary[]) : [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/profile" className="text-sm text-neutral-500">
          Profile
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Favorites</h1>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <p className="text-neutral-500 text-sm">No saved freelancers yet.</p>
      ) : (
        <div className="space-y-3">
          {favorites.map((f) => (
            <FreelancerCard key={f.id} freelancer={f} />
          ))}
        </div>
      )}
    </div>
  );
}
