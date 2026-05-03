import { useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageTemplate from '../components/layout/PageTemplate';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { SpecializationTreeList } from '@/components/SpecializationTreeList';
import type { ServiceSpecializationNode } from '@/lib/serviceCategories';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryNode {
  id: string;
  slug?: string;
  name: string;
  description: string | null;
  children?: CategoryNode[];
}

function toSpecTree(nodes?: CategoryNode[]): ServiceSpecializationNode[] {
  if (!nodes?.length) return [];
  return nodes.map((n) => ({
    id: n.id,
    name: n.name,
    children: toSpecTree(n.children),
  }));
}

/** Match route param to a node anywhere in the hierarchy by id only. */
function findCategoryInTree(roots: CategoryNode[], param: string): CategoryNode | null {
  const trimmed = param.trim();
  if (!trimmed) return null;

  const walk = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === trimmed) return node;
      if (node.children?.length) {
        const nested = walk(node.children);
        if (nested) return nested;
      }
    }
    return null;
  };

  return walk(roots);
}

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trimmedId = id?.trim() ?? '';

  const {
    data: categoriesRoots = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
    enabled: trimmedId.length > 0,
  });

  const category = useMemo(() => {
    if (!trimmedId) return null;
    return findCategoryInTree(categoriesRoots, trimmedId);
  }, [categoriesRoots, trimmedId]);

  const specializationTree = toSpecTree(category?.children);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.specialization-tree-root > *',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out', delay: 0.15 },
      );
    }, containerRef);
    return () => ctx.revert();
  }, [trimmedId, category?.id]);

  if (!trimmedId) {
    return (
      <PageTemplate title="Category Not Found">
        <div className="py-32 text-center">
          <p className="text-neutral-500 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="px-8 py-4 bg-black text-white rounded-full"
          >
            Back to Services
          </button>
        </div>
      </PageTemplate>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : "We couldn't load categories. Please try again.";
    return (
      <PageTemplate title="Category">
        <div className="py-24 max-w-md mx-auto space-y-6 text-center">
          <p className="text-neutral-700">{message}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => void refetch()}
              className="px-8 py-4 bg-black text-white rounded-full text-sm font-semibold"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="px-8 py-4 border border-neutral-200 rounded-full text-sm font-semibold"
            >
              Back to Services
            </button>
          </div>
        </div>
      </PageTemplate>
    );
  }

  if (isPending) {
    return (
      <PageTemplate title="Loading category">
        <div className="space-y-8 py-8">
          <Skeleton className="h-10 w-56 rounded-lg bg-neutral-100" />
          <Skeleton className="h-28 w-full max-w-2xl rounded-2xl bg-neutral-100" />
          <Skeleton className="h-72 w-full max-w-3xl rounded-2xl bg-neutral-100" />
        </div>
      </PageTemplate>
    );
  }

  if (!category) {
    return (
      <PageTemplate title="Category Not Found">
        <div className="py-32 text-center">
          <p className="text-neutral-500 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="px-8 py-4 bg-black text-white rounded-full"
          >
            Back to Services
          </button>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={category.name}>
      <div className="space-y-16" ref={containerRef}>
        {/* Back button and description */}
        <div className="pb-12 border-b border-neutral-100">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="group flex items-center gap-2 text-neutral-400 hover:text-black mb-8 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
            <span className="text-xs uppercase tracking-widest font-semibold">All Categories</span>
          </button>

          <p className="text-xl text-neutral-500 font-light leading-relaxed max-w-3xl">
            {category.description}
          </p>
        </div>

        {/* Specializations — same grouped / collapsible pattern as Services for clear parent/child context */}
        <div className="max-w-3xl">
          <h2 className="font-serif text-2xl text-black mb-2">Browse specializations</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Open each area to see what sits underneath. Tap a specialization to start an enquiry with that path
            filled in on the contact form.
          </p>
          {specializationTree.length > 0 ? (
            <div className="specialization-tree-root">
              <SpecializationTreeList
                nodes={specializationTree}
                breadcrumbPrefix={[category.name]}
                onLeafClick={(_leaf, pathFromRoot) => {
                  const context = pathFromRoot.join(' > ');
                  const subject = `Enquiry: ${pathFromRoot.join(' / ')}`;
                  navigate(`/contact?${new URLSearchParams({ subject, context }).toString()}`);
                }}
              />
            </div>
          ) : (
            <p className="text-neutral-500 text-sm">No subcategories are listed for this category yet.</p>
          )}
        </div>

        {/* CTA */}
        <section className="mt-32 p-12 lg:p-20 bg-neutral-50 rounded-[3rem] text-center">
          <h3 className="font-serif text-3xl lg:text-4xl mb-6">Can&apos;t find exactly what you need?</h3>
          <p className="text-neutral-500 mb-10 max-w-xl mx-auto">
            Our network is growing every day. If you don&apos;t see the specific service you&apos;re looking for, let us
            know and we&apos;ll help you find the right specialist.
          </p>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="px-12 py-5 bg-black text-white rounded-full font-semibold hover:scale-105 transition-transform"
          >
            Contact Support
          </button>
        </section>
      </div>
    </PageTemplate>
  );
};

export default CategoryPage;
