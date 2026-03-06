import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { get } from '@/lib/api';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  location: string;
  createdAt: string;
}

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const json = await get('/public/testimonials');
        if (json.success && json.data?.length > 0) {
          setTestimonials(json.data);
        }
      } catch {
        // silently fail -- section just won't render
      }
    };
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.testimonials-content',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.testimonials-content',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [testimonials]);

  if (testimonials.length === 0) return null;

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-neutral-900 text-white"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="testimonials-content">
          <div className="flex items-center justify-between mb-12">
            <p className="text-sm uppercase tracking-widest text-neutral-500">
              What people are saying
            </p>
            {testimonials.length > 1 && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center hover:border-white transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
                  className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center hover:border-white transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="relative min-h-[300px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-700 ${
                  index === currentIndex 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className="text-6xl text-neutral-700 font-serif mb-6">"</div>
                
                <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white leading-relaxed mb-10">
                  {testimonial.comment}
                </blockquote>

                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-white">{testimonial.isAnonymous ? 'Anonymous' : testimonial.name}</p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role === 'client' ? 'Client' : 'Skillancer'} · {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {testimonials.length > 1 && (
            <div className="flex gap-3 mt-12">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    index === currentIndex ? 'w-12 bg-white' : 'w-6 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
