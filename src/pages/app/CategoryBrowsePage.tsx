import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { CategoryNode } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryBrowsePage() {
  const { data: categories = [], isPending } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Categories</h1>
        <p className="text-neutral-600 text-sm mt-1">Explore services by category</p>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/app/category/${cat.id}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5 hover:border-neutral-300 transition-colors"
            >
              <h2 className="font-medium text-neutral-900">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{cat.description}</p>
              )}
              {cat.children && cat.children.length > 0 && (
                <p className="text-xs text-neutral-400 mt-2">{cat.children.length} subcategories</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
