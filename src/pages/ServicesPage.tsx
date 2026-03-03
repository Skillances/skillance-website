import { useState, useMemo, useEffect, useRef } from 'react';
import PageTemplate from '../components/layout/PageTemplate';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import gsap from 'gsap';
import { FLAT_CATEGORIES, CATEGORY_HIERARCHY } from '@/lib/categories';

const ServicesPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FLAT_CATEGORIES;
    
    const query = searchQuery.toLowerCase().trim();
    
    return FLAT_CATEGORIES.filter(cat => {
      // Search in category name
      if (cat.name.toLowerCase().includes(query)) return true;
      
      // Search in subcategories
      const subcats = CATEGORY_HIERARCHY[cat.id]?.subcategories || [];
      return subcats.some(sub => {
        if (sub.name.toLowerCase().includes(query)) return true;
        
        // Search in nested subcategories
        return sub.subcategories?.some(nested => 
          nested.name.toLowerCase().includes(query)
        );
      });
    });
  }, [searchQuery]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const ctx = gsap.context(() => {
      gsap.fromTo('.back-link', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, delay: 0.2, ease: 'power4.out' });
      gsap.fromTo('.service-item', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', delay: 0.4 });
    }, containerRef);
    return () => ctx.revert();
  }, [filteredCategories]); // Re-animate when filtered

  const getCategoryImage = (id: string) => {
    const images: Record<string, string> = {
      handyman: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=2070',
      education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070',
      cleaning: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2070',
      petcare: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=2042',
      fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070',
      automotive: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=2070',
      personalservices: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2084',
      gardening: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=2070',
      computer: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072',
      professionalservices: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2074',
      influencer: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=2070',
      photography: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=2074',
      videography: 'https://images.unsplash.com/photo-1574717024453-35405624cae3?auto=format&fit=crop&q=80&w=2070',
      music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=2070',
    };
    return images[id] || images.handyman;
  };

  return (
    <PageTemplate title="Current Services">
      <div className="space-y-16 lg:space-y-24" ref={containerRef}>
        <div className="flex flex-col md:flex-row gap-8 justify-between items-end back-link">
          <div>
            <button 
              onClick={() => navigate('/#services')}
              className="group flex items-center gap-3 text-neutral-400 hover:text-black transition-colors mb-6"
            >
              <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all group-hover:border-black group-hover:bg-black group-hover:text-white">
                <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
              </div>
              <span className="text-sm font-medium uppercase tracking-widest">Back to expertise</span>
            </button>
            <h2 className="font-serif text-4xl lg:text-5xl text-black">Find your <span className="italic">expertise</span></h2>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?" 
              className="w-full pl-14 pr-12 py-5 bg-neutral-50 rounded-full border border-neutral-100 focus:border-black outline-none transition-all font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {filteredCategories.map((category) => (
            <div 
              key={category.id}
              className="service-item group relative bg-neutral-50 rounded-[2.5rem] overflow-hidden hover:bg-neutral-100 transition-colors duration-500"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={getCategoryImage(category.id)} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0"
                />
              </div>
              
              <div className="p-5 lg:p-7">
                <div className="flex items-start justify-between w-full mb-2">
                  <h3 className="font-serif text-lg lg:text-xl text-black line-clamp-1">
                    {category.name}
                  </h3>
                  <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-black transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-1 duration-300 flex-shrink-0" />
                </div>
                
                <p className="text-neutral-500 text-xs font-light mb-4 leading-relaxed line-clamp-2 h-8">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-neutral-200/50">
                  <span className="text-[8px] uppercase tracking-[0.15em] text-neutral-400 font-bold whitespace-nowrap">
                    {category.subcategoryCount} Specializations
                  </span>
                  <button 
                    onClick={() => navigate(`/category/${category.id}`)}
                    className="text-[10px] font-semibold hover:text-black transition-colors flex items-center gap-1 group/btn whitespace-nowrap"
                  >
                    <span>Explore</span>
                    <ArrowUpRight className="w-2.5 h-2.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="py-32 text-center bg-neutral-50 rounded-[3rem] border border-dashed border-neutral-200">
            <h3 className="font-serif text-3xl mb-4">Expertise not found</h3>
            <p className="text-neutral-500 max-w-sm mx-auto mb-10">
              We couldn't find anything matching "<span className="text-black font-medium">{searchQuery}</span>". 
              Try searching for something else or contact us.
            </p>
            <button 
              onClick={() => navigate('/contact')}
              className="px-10 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all"
            >
              Suggest a category
            </button>
          </div>
        )}

        {/* Missing Expertise CTA - Only show when not searching or when items are found */}
        {filteredCategories.length > 0 && (
          <section className="bg-black text-white p-12 lg:p-20 rounded-[3rem] text-center shadow-2xl shadow-black/20">
            <h2 className="font-serif text-4xl lg:text-6xl mb-8">
              Don't see your expertise?
            </h2>
            <p className="text-xl text-neutral-400 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              We are constantly expanding our horizons. Contact us and we will work on adding your specific skillset to the Skillance ecosystem.
            </p>
            <button 
              onClick={() => navigate('/contact')}
              className="px-10 py-5 bg-white text-black rounded-full text-sm font-semibold hover:bg-neutral-200 transition-all hover:scale-[1.05]"
            >
              Contact us today
            </button>
          </section>
        )}
      </div>
    </PageTemplate>
  );
};

export default ServicesPage;
