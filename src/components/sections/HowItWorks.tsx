import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const clientSteps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Browse through our verified professionals or search with precise filters to find the perfect match for your needs.',
  },
  {
    number: '02',
    title: 'Review & Verify',
    description: 'Explore detailed profiles, past portfolios, and read verified reviews from our community of satisfied clients.',
  },
  {
    number: '03',
    title: 'Secure Booking',
    description: 'Message professionals directly and book securely through our protected payment gateway. Your funds are held safely until work is done.',
  },
  {
    number: '04',
    title: 'Quality Delivery',
    description: 'Collaborate seamlessly and approve the final work when you are 100% satisfied. Simple, safe, and professional.',
  },
];

const freelancerSteps = [
  {
    number: '01',
    title: 'Create Profile',
    description: 'Showcase your expertise. Build a professional portfolio and undergo our verification process to build trust.',
  },
  {
    number: '02',
    title: 'Receive Leads',
    description: 'Get matched with high-quality projects. We handle the discovery, so you can focus on your craft.',
  },
  {
    number: '03',
    title: 'Secure Payments',
    description: 'No more chasing invoices. Our milestone-based payment system ensures you get paid fairly and on time for every job.',
  },
  {
    number: '04',
    title: 'Grow Business',
    description: 'Build your reputation through our verified review system and scale your professional career with stable opportunities.',
  },
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'pro'>('client');
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSteps = activeTab === 'client' ? clientSteps : freelancerSteps;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo('.how-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.how-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Re-animate steps when tab changes
    const ctx = gsap.context(() => {
      const stepsElements = gsap.utils.toArray('.step-item');
      stepsElements.forEach((step: any, i) => {
        gsap.fromTo(step,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power2.out',
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-32 lg:py-48 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="how-header flex flex-col items-center mb-24">
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-8 font-medium">
            The Skillance Process
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl text-black leading-[1.1] mb-12 text-center max-w-4xl">
            Simple steps to{' '}
            <span className="italic">get things done.</span>
          </h2>

          {/* Tab Switcher */}
          <div className="flex bg-neutral-50 p-1.5 rounded-full border border-neutral-100 p-1.5 mt-4">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 ${
                activeTab === 'client' 
                  ? 'bg-black text-white shadow-xl shadow-black/10' 
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              For Hiring
            </button>
            <button
              onClick={() => setActiveTab('pro')}
              className={`px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 ${
                activeTab === 'pro' 
                  ? 'bg-black text-white shadow-xl shadow-black/10' 
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              For Working
            </button>
          </div>
        </div>

        {/* Steps */}
        <div ref={containerRef} className="steps-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeSteps.map((step) => (
                <div
                  key={step.number + activeTab}
                  className="step-item border-b border-neutral-100 py-16 lg:py-24 group hover:bg-neutral-50/50 transition-colors duration-500 rounded-3xl -mx-4 px-4"
                >
                  <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* Number */}
                    <div className="lg:col-span-2">
                      <span className="font-serif text-5xl lg:text-7xl text-neutral-300 block group-hover:text-black transition-colors duration-500 opacity-80 group-hover:opacity-100">
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-4 lg:pt-4">
                      <h3 className="font-serif text-3xl lg:text-4xl text-black">
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <div className="lg:col-span-6 lg:pt-4">
                      <p className="text-xl text-neutral-500 leading-relaxed font-light max-w-xl group-hover:text-neutral-600 transition-colors duration-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

