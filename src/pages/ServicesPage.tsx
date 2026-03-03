import { useEffect, useRef } from 'react';
import PageTemplate from '../components/layout/PageTemplate';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

interface ServiceCategory {
  name: string;
  description: string;
  count: string;
  popular?: boolean;
  image: string;
}

const allServices: ServiceCategory[] = [
  {
    name: 'Handyman',
    description: 'Home repair and maintenance services',
    count: '17+ Services',
    popular: true,
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Education',
    description: 'Tutoring and educational services',
    count: '7+ Services',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Cleaning',
    description: 'Professional cleaning services',
    count: '2+ Services',
    image: 'https://images.unsplash.com/photo-3hO8igCybds?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Pet Care',
    description: 'Pet services and care',
    count: '11+ Services',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=2042',
  },
  {
    name: 'Fitness',
    description: 'Personal training and wellness',
    count: '12+ Services',
    popular: true,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Automotive',
    description: 'Vehicle repair and maintenance',
    count: '12+ Services',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Personal Services',
    description: 'Personal assistance and care',
    count: '12+ Services',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2084',
  },
  {
    name: 'Gardening & Landscaping',
    description: 'Garden and landscape services',
    count: '12+ Services',
    image: 'https://images.unsplash.com/photo-CbZh3kaPxrE?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Technology & IT',
    description: 'IT and technology services',
    count: '11+ Services',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072',
  },
  {
    name: 'Professional Services',
    description: 'Business and professional services',
    count: '12+ Services',
    image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2074',
  },
  {
    name: 'Influencing',
    description: 'Social media and influencer services',
    count: '8+ Services',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Photography',
    description: 'Professional photography services',
    count: '12+ Services',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=2074',
  },
  {
    name: 'Videography',
    description: 'Professional videography services',
    count: '11+ Services',
    image: 'https://images.unsplash.com/photo-so93GwxYr8s?auto=format&fit=crop&q=80&w=2070',
  },
  {
    name: 'Music',
    description: 'Music and audio services',
    count: '12+ Services',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=2070',
  },
];

const ServicesPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    
    const ctx = gsap.context(() => {
      gsap.fromTo('.back-link', 
        { opacity: 0, x: -20 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1, 
          delay: 0.2,
          ease: 'power4.out' 
        }
      );
      
      gsap.fromTo('.service-item', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.05, 
          ease: 'power3.out',
          delay: 0.4
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <PageTemplate title="Current Services">
      <div className="space-y-24" ref={containerRef}>
        {/* Navigation / Back Button */}
        <div className="back-link">
          <button 
            onClick={() => navigate('/#services')}
            className="group flex items-center gap-3 text-neutral-400 hover:text-black transition-colors"
          >
            <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all group-hover:border-black group-hover:bg-black group-hover:text-white">
              <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
            </div>
            <span className="text-sm font-medium uppercase tracking-widest">Back to expertise</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allServices.map((service) => (
            <div 
              key={service.name}
              className="service-item group relative bg-neutral-50 rounded-3xl overflow-hidden hover:bg-neutral-100 transition-colors duration-500"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              
              <div className="p-8">
                <div className="mb-4 h-20 flex flex-col justify-end relative">
                  {service.popular && (
                    <span className="absolute top-0 left-0 px-3 py-1 bg-black text-white text-[10px] uppercase tracking-widest rounded-full">
                      Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between w-full">
                    <h3 className="font-serif text-2xl lg:text-3xl text-black">
                      {service.name}
                    </h3>
                    <ArrowUpRight className="w-6 h-6 text-neutral-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
                
                <p className="text-neutral-500 font-light mb-6">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                    {service.count}
                  </span>
                  <button 
                    onClick={() => navigate(`/category/${service.name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-')}`)}
                    className="text-sm font-medium hover:underline"
                  >
                    View Specialists
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Missing Expertise CTA */}
        <section className="bg-black text-white p-12 lg:p-20 rounded-[3rem] text-center">
          <h2 className="font-serif text-4xl lg:text-6xl mb-8">
            Don't see your expertise?
          </h2>
          <p className="text-xl text-neutral-400 font-light max-w-2xl mx-auto mb-12">
            We are constantly expanding our horizons. Contact us and we will work on adding your specific skillset to the Skillance ecosystem.
          </p>
          <button 
            onClick={() => navigate('/contact')}
            className="px-10 py-5 bg-white text-black rounded-full text-sm font-semibold hover:bg-neutral-200 transition-all hover:scale-[1.05]"
          >
            Contact us today
          </button>
        </section>
      </div>
    </PageTemplate>
  );
};

export default ServicesPage;
