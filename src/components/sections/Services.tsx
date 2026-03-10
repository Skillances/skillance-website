import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowUpRight, Hammer, GraduationCap, Sparkles, Dog, Dumbbell, Car } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function getUnsplashUrl(url: string, width: number): string {
  return url.replace(/w=\d+/, `w=${width}`);
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
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=2070',
    icon: Hammer,
    subcategories: ['General Repairs', 'Furniture Assembly', 'TV Mounting', 'Electrical', 'Plumbing', 'Painting', 'Carpentry', 'Appliance Install'],
  },
  {
    name: 'Education',
    description: 'Expand your horizons.',
    longDescription: 'Unlock your potential with personalized learning. Our expert tutors provide the support and guidance needed to master any subject and reach your academic or professional goals.',
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070',
    icon: GraduationCap,
    subcategories: ['Math Tutoring', 'Science Tutoring', 'Language Lessons', 'Music Lessons', 'Career Development', 'Digital Skills', 'Art & Design', 'Test Prep'],
  },
  {
    name: 'Cleaning',
    description: 'Spotless spaces, total peace.',
    longDescription: 'Experience the luxury of a pristine environment. Our professional cleaning teams deliver meticulous care for homes and offices, using safe and effective methods for a healthier space.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2070',
    icon: Sparkles,
    subcategories: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'End of Tenancy', 'Window Cleaning', 'Carpet Cleaning', 'Laundry Service', 'Organization'],
  },
  {
    name: 'Pet Care',
    description: 'Your pets, our priority.',
    longDescription: 'Give your furry friends the very best. From energetic walks to gentle grooming and trusted sitting, we provide the love and attention your pets deserve when you can’t be there.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=2042',
    icon: Dog,
    subcategories: ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training', 'Vet Visits', 'Daycare', 'Pet Taxi', 'Nutrition Care'],
  },
  {
    name: 'Fitness',
    description: 'Achieve your peak self.',
    longDescription: 'Transform your lifestyle with expert guidance. Whether it’s high-intensity training or mindfulness through yoga, our wellness professionals help you achieve your health goals.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070',
    icon: Dumbbell,
    subcategories: ['Personal Training', 'Yoga', 'Pilates', 'Nutrition Planning', 'Sports Coaching', 'Stretching & Recovery', 'Group Classes', 'Health Coaching'],
  },
  {
    name: 'Automotive',
    description: 'Driving excellence always.',
    longDescription: 'Reliable care for the road ahead. Our automotive experts provide everything from routine maintenance to detailed care, ensuring your vehicle remains in peak performance.',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=2070',
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
                className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-neutral-100 flex flex-col justify-end p-8 lg:p-10 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              >
                {/* Background Image */}
                <img 
                  src={getUnsplashUrl(category.image, 800)} 
                  srcSet={`${getUnsplashUrl(category.image, 400)} 400w, ${getUnsplashUrl(category.image, 800)} 800w, ${getUnsplashUrl(category.image, 1200)} 1200w`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  alt={category.name}
                  width={800}
                  height={1000}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0"
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 opacity-90 group-hover:opacity-100" />
                
                {/* Content */}
                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-3xl lg:text-4xl text-white">
                      {category.name}
                    </h3>
                    <ArrowUpRight className="w-6 h-6 text-white/50 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                  <p className="text-white/70 font-light leading-relaxed mb-0 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
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

      {/* Enhanced Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[100] flex flex-col sm:items-center sm:justify-center bg-white sm:bg-transparent">
          {/* Backdrop for Desktop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-opacity duration-700 hidden sm:block"
            onClick={() => setSelectedCategory(null)}
          />
          
          <div className="relative bg-white w-full sm:max-w-4xl h-full sm:h-auto sm:max-h-[92dvh] overflow-hidden sm:rounded-[3rem] shadow-2xl flex flex-col sm:flex-row transition-all duration-500 animate-slide-up">
            {/* Modal Image Section - Hidden on mobile for better space usage */}
            <div className="hidden sm:block sm:w-1/2 relative min-h-0 shrink-0 sm:shrink overflow-hidden">
              <img 
                src={getUnsplashUrl(selectedCategory.image, 800)} 
                srcSet={`${getUnsplashUrl(selectedCategory.image, 400)} 400w, ${getUnsplashUrl(selectedCategory.image, 800)} 800w`}
                sizes="(max-width: 640px) 100vw, 50vw"
                width={800}
                height={1000}
                className="absolute inset-0 w-full h-full object-cover"
                alt={`${selectedCategory.name} service`}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Modal Content Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-white sm:w-1/2">
              {/* Close Button - Universal position */}
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-neutral-100 sm:bg-neutral-50 hover:bg-neutral-200 sm:hover:bg-neutral-100 flex items-center justify-center text-black transition-colors z-[110]"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 lg:p-16">
                <div className="flex items-center gap-4 mb-4 mt-6 sm:mt-0">
                  <span className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-500 font-medium font-sans">Professional Services</span>
                </div>
                
                <h3 className="font-serif text-3xl sm:text-4xl text-black mb-4 sm:mb-6">{selectedCategory.name}</h3>
                <p className="text-sm sm:text-base text-neutral-500 leading-relaxed font-light mb-8 sm:mb-10">
                  {selectedCategory.longDescription}
                </p>

                <div className="space-y-4 pb-8">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold mb-4 sm:mb-6 font-sans">Available Specializations</p>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-x-8 gap-y-3 sm:gap-y-4">
                    {selectedCategory.subcategories.map(sub => (
                      <div key={sub} className="flex items-center gap-3 group/item cursor-default">
                        <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full group-hover/item:bg-black group-hover/item:scale-125 transition-all" />
                        <span className="text-sm sm:text-base text-neutral-600 group-hover/item:text-black transition-colors">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-6 sm:p-8 lg:p-16 pt-4 sm:pt-0 bg-white border-t sm:border-t-0 border-neutral-100 shrink-0">
                <button className="w-full bg-black text-white py-4 sm:py-6 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all transform hover:scale-[1.02] shadow-xl shadow-black/10">
                  Book a {selectedCategory.name} Expert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Services;
