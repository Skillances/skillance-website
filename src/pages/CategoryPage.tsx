import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTemplate from '../components/layout/PageTemplate';
import { ArrowUpRight, Search, Filter } from 'lucide-react';
import gsap from 'gsap';

interface Specialist {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  image: string;
  location: string;
}

const categoriesMap: Record<string, { title: string; roles: string[] }> = {
  'handyman': {
    title: 'Handyman',
    roles: [
      'Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tiler', 'Roofer', 
      'Locksmith', 'Appliance Repair', 'General Handyman', 'HVAC Services', 
      'Flooring', 'Drywall Repair', 'Fence Installation', 'Deck Building', 
      'Cabinet Installation', 'Bathroom Renovation', 'Kitchen Installation'
    ]
  },
  'gardening-landscaping': {
    title: 'Gardening & Landscaping',
    roles: ['Lawn Care', 'Garden Design', 'Tree Felling', 'Irrigation']
  },
  'technology-it': {
    title: 'Technology & IT',
    roles: ['Web Development', 'Computer Repair', 'Network Setup', 'Smart Home']
  }
};

const getSpecialists = (slug: string): Specialist[] => {
  const category = categoriesMap[slug.toLowerCase()];
  if (!category) return [];
  
  return category.roles.map((role, i) => ({
    id: `${slug}-${i}`,
    name: `Pro ${role.split(' ')[0]}`,
    role: role,
    rating: 4.7 + (Math.random() * 0.3),
    reviews: Math.floor(Math.random() * 150) + 20,
    image: `https://images.unsplash.com/photo-1581578731548-c64695cc6954?auto=format&fit=crop&q=80&w=200&h=200`,
    location: 'Cape Town, ZA'
  }));
};

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const categoryData = id ? categoriesMap[id.toLowerCase()] : null;
  const specialists = id ? getSpecialists(id) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    // GSAP animations for cards
    const ctx = gsap.context(() => {
      gsap.fromTo('.specialist-card', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [id]);

  const displayName = categoryData?.title || (id ? id.replace(/-/g, ' ') : 'Category');

  return (
    <PageTemplate title={`${displayName} Specialists`}>
      <div className="space-y-16" ref={containerRef}>
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row gap-8 justify-between items-end pb-12 border-b border-neutral-100">
          <div className="max-w-xl">
            <button 
              onClick={() => navigate('/services')}
              className="group flex items-center gap-2 text-neutral-400 hover:text-black mb-8 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
              <span className="text-xs uppercase tracking-widest font-semibold">All Categories</span>
            </button>
            <h2 className="font-serif text-4xl lg:text-5xl text-black mb-4 capitalize">
              Find the best <br /><span className="italic">{id} professionals</span>
            </h2>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search specialty..." 
                className="w-full pl-14 pr-8 py-4 bg-neutral-50 rounded-full border border-neutral-100 focus:border-black outline-none"
              />
            </div>
            <button className="p-4 bg-neutral-50 rounded-full border border-neutral-100 hover:bg-black hover:text-white transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {specialists.map((specialist) => (
            <div 
              key={specialist.id}
              className="specialist-card group bg-white p-6 rounded-3xl border border-neutral-100 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100">
                  <img src={specialist.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-serif text-lg text-black">{specialist.name}</h4>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">{specialist.role}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-neutral-50">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-black">{specialist.rating.toFixed(1)}</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-xs text-neutral-400 ml-1">({specialist.reviews})</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-medium">{specialist.location}</span>
              </div>
              
              <button className="w-full py-4 bg-neutral-50 text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Request Quote
              </button>
            </div>
          ))}
          
          {specialists.length === 0 && (
            <div className="col-span-full py-20 text-center bg-neutral-50 rounded-[3rem]">
              <p className="text-neutral-400 italic">No specialists listed in this category yet. We are onboarding new professionals daily.</p>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
};

export default CategoryPage;
