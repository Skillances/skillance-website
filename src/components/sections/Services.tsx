import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowUpRight, Hammer, GraduationCap, Sparkles, Dog, Dumbbell, Car } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function getUnsplashUrl(url: string, width: number, height?: number): string {
  let result = url.replace(/w=\d+/, `w=${width}`);
  if (height) result = result.replace(/h=\d+/, `h=${height}`);
  return result;
}

interface ServiceCategory {
  name: string;
  description: string;
  longDescription: string;
  image: string;
  icon: React.ElementType;
  subcategories: string[];
}

const serviceCategories: ServiceCategory[] = [
  {
    name: 'Handyman',
    description: 'Precision in every repair.',
    longDescription: 'From intricate repairs to full installations, our expert handymen bring precision and reliability to every corner of your home. We handle the hard work so you can enjoy your space.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=85&w=1200&h=1500',
    icon: Hammer,
    subcategories: ['General Repairs', 'Furniture Assembly', 'TV Mounting', 'Electrical', 'Plumbing', 'Painting', 'Carpentry', 'Appliance Install'],
  },
  {
    name: 'Education',
    description: 'Expand your horizons.',
    longDescription: 'Unlock your potential with personalized learning. Our expert tutors provide the support and guidance needed to master any subject and reach your academic or professional goals.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=85&w=1200&h=1500',
    icon: GraduationCap,
    subcategories: ['Math Tutoring', 'Science Tutoring', 'Language Lessons', 'Music Lessons', 'Career Development', 'Digital Skills', 'Art & Design', 'Test Prep'],
  },
  {
    name: 'Cleaning',
    description: 'Spotless spaces, total peace.',
    longDescription: 'Experience the luxury of a pristine environment. Our professional cleaning teams deliver meticulous care for homes and offices, using safe and effective methods for a healthier space.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=85&w=1200&h=1500',
    icon: Sparkles,
    subcategories: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'End of Tenancy', 'Window Cleaning', 'Carpet Cleaning', 'Laundry Service', 'Organization'],
  },
  {
    name: 'Pet Care',
    description: 'Your pets, our priority.',
    longDescription: "Give your furry friends the very best. From energetic walks to gentle grooming and trusted sitting, we provide the love and attention your pets deserve when you can't be there.",
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=85&w=1200&h=1500',
    icon: Dog,
    subcategories: ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training', 'Vet Visits', 'Daycare', 'Pet Taxi', 'Nutrition Care'],
  },
  {
    name: 'Fitness',
    description: 'Achieve your peak self.',
    longDescription: "Transform your lifestyle with expert guidance. Whether it's high-intensity training or mindfulness through yoga, our wellness professionals help you achieve your health goals.",
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=85&w=1200&h=1500',
    icon: Dumbbell,
    subcategories: ['Personal Training', 'Yoga', 'Pilates', 'Nutrition Planning', 'Sports Coaching', 'Stretching & Recovery', 'Group Classes', 'Health Coaching'],
  },
  {
    name: 'Automotive',
    description: 'Driving excellence always.',
    longDescription: 'Reliable care for the road ahead. Our automotive experts provide everything from routine maintenance to detailed care, ensuring your vehicle remains in peak performance.',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&q=85&w=1200&h=1500',
    icon: Car,
    subcategories: ['Car Wash', 'Full Detailing', 'Mechanic Services', 'Oil & Filter', 'Battery Service', 'Tire Rotation', 'Pre-purchase Check', 'Diagnostic'],
  },
];

const Services = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
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

  return (
    <section 
      id="services" 
      ref={sectionRef} 
      className="py-24 lg:py-32 2xl:py-24 bg-white overflow-hidden"
      style={{ scrollMarginTop: '152px' }}
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
                  src={getUnsplashUrl(category.image, 800, 1000)}
                  srcSet={`${getUnsplashUrl(category.image, 480, 600)} 480w, ${getUnsplashUrl(category.image, 800, 1000)} 800w, ${getUnsplashUrl(category.image, 1200, 1500)} 1200w`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                src={getUnsplashUrl(selectedCategory.image, 800, 1000)}
                srcSet={`${getUnsplashUrl(selectedCategory.image, 480, 600)} 480w, ${getUnsplashUrl(selectedCategory.image, 800, 1000)} 800w`}
                sizes="40vw"
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
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.subcategories.map(sub => (
                      <span
                        key={sub}
                        className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs text-neutral-600 hover:border-black hover:text-black hover:bg-neutral-50 transition-all cursor-default"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
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
