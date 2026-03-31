import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '../components/layout/PageTemplate';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { get } from '@/lib/api';

interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  children?: CategoryNode[];
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
        const normalizedSlug = id.toLowerCase();
        const found = categories.find((c) => c.slug?.toLowerCase() === normalizedSlug) || null;

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

  const flattenChildren = (nodes?: CategoryNode[]): Array<{ id: string; slug: string; name: string; depth: number }> => {
    if (!nodes || nodes.length === 0) return [];
    const out: Array<{ id: string; slug: string; name: string; depth: number }> = [];
    const walk = (list: CategoryNode[], depth: number) => {
      list.forEach((n) => {
        out.push({ id: n.id, slug: n.slug, name: n.name, depth });
        if (n.children?.length) walk(n.children, depth + 1);
      });
    };
    walk(nodes, 0);
    return out;
  };

  const subcategories = flattenChildren(category?.children);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo('.subcategory-item', 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out', delay: 0.2 }
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

        {/* Subcategories List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-4">
          {subcategories.map((sub) => (
            <div 
              key={sub.id}
              className="subcategory-item group flex items-center justify-between py-6 border-b border-neutral-50 hover:border-black transition-colors cursor-pointer"
              onClick={() => navigate(`/contact?interest=${encodeURIComponent(sub.slug)}`)}
            >
              <div className="flex flex-col">
                <h4 className="text-lg lg:text-xl font-medium text-neutral-800 group-hover:text-black transition-colors">
                  {sub.name}
                </h4>
                {sub.depth > 0 && <p className="text-xs text-neutral-400 mt-1">Level {sub.depth + 1}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest text-neutral-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  Enquire Now
                </span>
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
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
