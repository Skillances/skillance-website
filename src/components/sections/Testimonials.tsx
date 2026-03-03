import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  id: number;
  name: string;
  role: 'client' | 'skillancer';
  quote: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    role: 'client',
    quote: 'I found an amazing math tutor for my daughter through Skillance. The verification process gave me peace of mind, and the tutor was professional and punctual.',
    location: 'Cape Town',
  },
  {
    id: 2,
    name: 'James Nkosi',
    role: 'skillancer',
    quote: 'As a handyman, Skillance has transformed my business. I now have a steady stream of clients who trust my work. The platform handles payments securely.',
    location: 'Johannesburg',
  },
  {
    id: 3,
    name: 'Emma van der Berg',
    role: 'client',
    quote: 'The pet sitting service was a lifesaver when I had to travel for work. My dogs were well cared for, and I received daily updates.',
    location: 'Pretoria',
  },
  {
    id: 4,
    name: 'David Petersen',
    role: 'skillancer',
    quote: 'I started offering fitness training on Skillance six months ago. The platform is easy to use, and I have built a loyal client base.',
    location: 'Durban',
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
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
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-neutral-900 text-white"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="testimonials-content">
          {/* Section Label */}
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-12">
            What Our Users Say
          </p>

          {/* Testimonial */}
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
                {/* Quote Mark */}
                <div className="text-6xl text-neutral-700 font-serif mb-6">"</div>
                
                {/* Quote */}
                <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white leading-relaxed mb-10">
                  {testimonial.quote}
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">
                      {testimonial.role === 'client' ? 'Client' : 'Skillancer'} · {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
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
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
