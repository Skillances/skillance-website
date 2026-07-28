import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { FreelancerCard } from '@/components/app/FreelancerCard';
import type { CategoryNode, FreelancerSummary } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';

function findCategoryInTree(roots: CategoryNode[], param: string): CategoryNode | null {
  const walk = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === param) return node;
      if (node.children?.length) {
        const nested = walk(node.children);
        if (nested) return nested;
      }
    }
    return null;
  };
  return walk(roots);
}

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const id = categoryId?.trim() ?? '';

  const { data: categories = [], isPending: catLoading } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  const category = useMemo(() => findCategoryInTree(categories, id), [categories, id]);

  const { data: freelancers = [], isPending: flLoading } = useQuery({
    queryKey: queryKeys.freelancers.list({ categoryIds: [id] }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('categoryIds', id);
      params.set('limit', '30');
      const res = await get(`${ApiPaths.freelancers.list}?${params.toString()}`);
      const data = res?.data?.freelancers ?? res?.data ?? [];
      return Array.isArray(data) ? (data as FreelancerSummary[]) : [];
    },
    enabled: id.length > 0,
  });

  if (catLoading) {
    return <Skeleton className="h-40 rounded-2xl" />;
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Category not found.</p>
        <Link to="/app/categories" className="text-sm text-neutral-900 underline mt-2 inline-block">
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/categories" className="text-sm text-neutral-500 hover:text-neutral-900">
          Categories
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-900 mt-1">{category.name}</h1>
        {category.description && (
          <p className="text-neutral-600 mt-2">{category.description}</p>
        )}
      </div>

      {category.children && category.children.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-neutral-700 mb-2">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                to={`/app/category/${child.id}`}
                className="text-sm px-3 py-1.5 rounded-full border border-neutral-200 bg-white"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Freelancers</h2>
        {flLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : freelancers.length === 0 ? (
          <p className="text-neutral-500 text-sm">No freelancers in this category yet.</p>
        ) : (
          <div className="space-y-3">
            {freelancers.map((f) => (
              <FreelancerCard key={f.id} freelancer={f} showDistance />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
