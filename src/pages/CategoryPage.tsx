import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '../components/layout/PageTemplate';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { get } from '@/lib/api';
import { SpecializationTreeList } from '@/components/SpecializationTreeList';
import type { ServiceSpecializationNode } from '@/lib/serviceCategories';

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
  const [category, setCategory] = useState<CategoryNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadCategory = async () => {
      if (!id) {
        if (mounted) {
          setCategory(null);
          setNotFound(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setNotFound(false);
        const res = await get('/categories');
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        if (!mounted) return;

        const categories = Array.isArray(data) ? (data as CategoryNode[]) : [];
        const found = findCategoryInTree(categories, id);

        if (found) {
          setCategory(found);
          setNotFound(false);
        } else {
          setCategory(null);
          setNotFound(true);
        }
      } catch {
        if (!mounted) return;
        setCategory(null);
        setNotFound(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadCategory();
    return () => {
      mounted = false;
    };
  }, [id]);

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
  }, [id, category?.id]);

  if (isLoading) {
    return (
      <PageTemplate title="Loading Category">
        <div className="py-32 text-center">
          <p className="text-neutral-500">Loading category...</p>
        </div>
      </PageTemplate>
    );
  }

  if (notFound || !category) {
    return (
      <PageTemplate title="Category Not Found">
        <div className="py-32 text-center">
          <p className="text-neutral-500 mb-8">The category you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/services')} className="px-8 py-4 bg-black text-white rounded-full">
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
          <h3 className="font-serif text-3xl lg:text-4xl mb-6">Can't find exactly what you need?</h3>
          <p className="text-neutral-500 mb-10 max-w-xl mx-auto">
            Our network is growing every day. If you don't see the specific service you're looking for, let us know and we'll help you find the right specialist.
          </p>
          <button 
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
