import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowUpRight } from 'lucide-react';
import { fetchServiceCategories, type ServiceCategoryItem } from '@/lib/serviceCategories';
import { SpecializationTreeList } from '@/components/SpecializationTreeList';

gsap.registerPlugin(ScrollTrigger);

type ServiceCategory = ServiceCategoryItem;
const HOME_SERVICES_VISIBLE_COUNT = 6;
const HOME_SERVICES_ROTATE_DAYS = 1;

function pickRotatingCategories(items: ServiceCategory[], count: number): ServiceCategory[] {
  if (items.length <= count) return items;
  const msPerDay = 24 * 60 * 60 * 1000;
  const rotationBucket = Math.floor(Date.now() / (msPerDay * HOME_SERVICES_ROTATE_DAYS));
  const start = rotationBucket % items.length;
  const rotated = items.slice(start).concat(items.slice(0, start));
  return rotated.slice(0, count);
}

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.services-header',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.services-header',
            start: 'top 85%',
          },
        }
      );

      gsap.fromTo('.service-card-wrapper',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.services-grid',
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedCategory]);

  useEffect(() => {
    let mounted = true;
    fetchServiceCategories()
      .then((items) => {
        if (mounted) setServiceCategories(pickRotatingCategories(items, HOME_SERVICES_VISIBLE_COUNT));
      })
      .catch(() => {
        // Keep section stable if API fails.
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section 
      id="services" 
      ref={sectionRef} 
      className="py-24 lg:py-32 2xl:py-24 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="services-header max-w-3xl mb-24">
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-500 mb-8 font-medium">
            Core Expertise
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-black leading-[1.05] mb-8">
            One platform, <br />
            <span className="italic">limitless possibilities.</span>
          </h2>
          <p className="text-xl text-neutral-500 font-light leading-relaxed max-w-xl">
            From essential home maintenance to specialized personal growth, 
            discover trusted professionals for every chapter of your life.
          </p>
        </div>

        {/* New Immersive Grid */}
        <div className="services-grid grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {serviceCategories.map((category) => (
            <div key={category.name} className="service-card-wrapper group">
              <button
                onClick={() => setSelectedCategory(category)}
                className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-200 flex flex-col justify-end p-8 lg:p-10 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              >
                {/* Background Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                {/* Gradient overlay — two-layer for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10 w-full">
                  <div className="flex items-end justify-between gap-3 mb-3">
                    <h3 className="font-serif text-3xl lg:text-[2rem] xl:text-4xl text-white leading-tight">
                      {category.name}
                    </h3>
                    <div className="shrink-0 w-9 h-9 rounded-full border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                      <ArrowUpRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-white/65 text-sm font-light leading-relaxed transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                    {category.description}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Explore More CTA */}
        <div className="flex flex-col items-center gap-8 pt-12 border-t border-neutral-100">
          <p className="text-neutral-500 font-serif text-2xl italic">and many more...</p>
          <button 
            onClick={() => window.location.href = '/services'}
            className="group flex items-center gap-4 px-10 py-5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:scale-[1.05]"
          >
            Explore all categories
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>
        </div>
      </div>

      {/* Enhanced Modal rendered in portal to avoid section-offset/fixed-position bugs */}
      {selectedCategory && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-white sm:flex sm:items-center sm:justify-center sm:bg-transparent sm:p-6 sm:min-h-0 lg:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="services-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xl hidden sm:block"
            onClick={() => setSelectedCategory(null)}
            aria-hidden="true"
          />

          <div className="relative flex min-h-0 h-full w-full flex-col overflow-hidden bg-white sm:h-auto sm:max-h-[min(85dvh,calc(100dvh-4rem))] sm:max-w-4xl sm:rounded-[2.5rem] sm:shadow-2xl sm:flex-row">
            <div className="hidden sm:flex sm:w-[42%] relative shrink-0 overflow-hidden min-h-0 sm:min-h-[min(420px,42dvh)] sm:max-h-[min(85dvh,calc(100dvh-4rem))] sm:self-stretch">
              <img
                src={selectedCategory.image}
                width={800}
                height={1000}
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
                alt={`${selectedCategory.name} service`}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="flex-1 flex flex-col min-h-0 bg-white overflow-hidden">
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-black transition-colors z-[110] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10 min-h-0">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium block mb-4 mt-6 sm:mt-0">Professional Services</span>
                <h3 id="services-modal-title" className="font-serif text-3xl sm:text-4xl text-black mb-4 pr-12 sm:pr-0">
                  {selectedCategory.name}
                </h3>
                <p className="text-sm sm:text-base text-neutral-500 leading-relaxed font-light mb-8">
                  {selectedCategory.longDescription}
                </p>

                <div className="pb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-4">Available Specializations</p>
                  {selectedCategory.specializationTree.length > 0 ? (
                    <SpecializationTreeList nodes={selectedCategory.specializationTree} compact />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedCategory.subcategories.map((sub) => (
                        <span
                          key={sub}
                          className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all cursor-default"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:px-10 sm:pb-10 sm:pt-4 bg-white border-t border-neutral-100 shrink-0">
                <button className="w-full bg-black text-white py-4 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-lg shadow-black/10">
                  Book a {selectedCategory.name} Expert
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default Services;
