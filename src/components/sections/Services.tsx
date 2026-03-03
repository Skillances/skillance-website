import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ArrowUpRight, Hammer, GraduationCap, Sparkles, Dog, Dumbbell, Car } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

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
    image: 'https://images.unsplash.com/photo-3hO8igCybds?auto=format&fit=crop&q=80&w=2070',
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
      className="py-32 lg:py-48 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="services-header max-w-3xl mb-24">
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-400 mb-8 font-medium">
            Core Expertise
          </p>
          <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-black leading-[1.05] mb-8">
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
                  src={category.image} 
                  alt={category.name}
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
          <p className="text-neutral-400 font-serif text-2xl italic">and many more...</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-opacity duration-700"
            onClick={() => setSelectedCategory(null)}
          />
          
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] lg:h-auto overflow-hidden rounded-none lg:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row transition-all duration-500 animate-slide-up">
            {/* Modal Image Section */}
            <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full">
              <img 
                src={selectedCategory.image} 
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-black/20" />
              <button
                onClick={() => setSelectedCategory(null)}
                className="absolute top-8 left-8 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white lg:hidden"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content Section */}
            <div className="lg:w-1/2 flex flex-col bg-white">
              <div className="p-8 lg:p-16 flex-1 overflow-y-auto">
                <div className="mb-8">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="absolute top-8 right-8 w-12 h-12 rounded-full bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center text-black hidden lg:flex transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-4 mb-4">
                    <selectedCategory.icon className="w-8 h-8 text-black" />
                    <span className="text-sm uppercase tracking-widest text-neutral-400 font-medium font-sans">Professional Services</span>
                  </div>
                  
                  <h3 className="font-serif text-5xl text-black mb-8">{selectedCategory.name}</h3>
                  <p className="text-lg text-neutral-500 leading-relaxed font-light mb-12">
                    {selectedCategory.longDescription}
                  </p>

                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-bold mb-6 font-sans">Available Specializations</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      {selectedCategory.subcategories.map(sub => (
                        <div key={sub} className="flex items-center gap-3 group/item cursor-default">
                          <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full group-hover/item:bg-black group-hover/item:scale-125 transition-all" />
                          <span className="text-neutral-600 group-hover/item:text-black transition-colors">{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer for Mobile Visibility */}
              <div className="p-8 lg:p-16 pt-0 lg:pt-0 bg-white border-t lg:border-t-0 border-neutral-100 lg:bg-transparent">
                <button className="w-full bg-black text-white py-6 rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all transform hover:scale-[1.02] shadow-xl shadow-black/10">
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
