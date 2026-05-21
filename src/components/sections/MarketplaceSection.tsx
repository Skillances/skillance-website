import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MarketplaceGradientText,
  MarketplaceNewMark,
} from '@/components/marketplace/MarketplaceAccent';

gsap.registerPlugin(ScrollTrigger);

// ─── Feature Cards ────────────────────────────────────────────────────────────

const featureCards = [
  {
    number: '01',
    title: 'Publish in minutes',
    description:
      'Upload your material, set a price, and go live. Your listing reaches learners on Skillance right away.',
  },
  {
    number: '02',
    title: 'Browse and filter',
    description:
      'Discover courses, documents, and training packs. Filter by topic, format, and price to find what fits your goals.',
  },
  {
    number: '03',
    title: 'Safe & transparent',
    description:
      'Only 5% fee on successful sales. No listing fees, no subscriptions — just straightforward digital commerce.',
  },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────

const buyerSteps = [
  {
    number: '01',
    title: 'Browse & discover',
    description:
      'Search the marketplace. Filter by category, format, and price to find courses, documents, and training material that match your needs.',
  },
  {
    number: '02',
    title: 'Preview & purchase',
    description:
      'Review listings, message sellers in the app, and checkout securely when you are ready to buy.',
  },
  {
    number: '03',
    title: 'Access your content',
    description:
      'Get instant digital delivery. Your purchase is recorded so you can return to your materials anytime.',
  },
];

const sellerSteps = [
  {
    number: '01',
    title: 'Create your listing',
    description:
      'Add your course, document pack, or training material, write a clear description, set your price, and publish — often in under two minutes.',
  },
  {
    number: '02',
    title: 'Receive enquiries',
    description:
      'Learners message you directly. Answer questions, clarify what is included, and support buyers — all in one place.',
  },
  {
    number: '03',
    title: 'Get paid',
    description:
      'Complete the sale and receive payment. We charge just 5% on success — no listing fees, no monthly subscriptions.',
  },
];

// ─── Divider Banner ───────────────────────────────────────────────────────────

export const MarketplaceDivider = () => (
  <div
    id="marketplace-intro"
    className="section-scroll-anchor w-full bg-neutral-900 py-10 px-6 lg:px-8 overflow-hidden"
  >
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <MarketplaceNewMark variant="badge" />
        <p className="font-serif text-2xl sm:text-3xl text-white text-center sm:text-left">
          Introducing:{' '}
          <MarketplaceGradientText className="italic">
            Skillance Marketplace
          </MarketplaceGradientText>
        </p>
      </div>
      <p className="text-sm text-neutral-400 text-center sm:text-right max-w-xs">
        Courses, documents, and training — inside the Skillance app.
      </p>
    </div>
  </div>
);

// ─── Main Section ─────────────────────────────────────────────────────────────

const MarketplaceSection = () => {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const activeSteps = activeTab === 'buyer' ? buyerSteps : sellerSteps;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.mkt-header',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.mkt-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.mkt-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.mkt-cards-grid',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.mkt-hiw-header',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.mkt-hiw-header',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.mkt-cta',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.mkt-cta',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const stepEls = gsap.utils.toArray<HTMLElement>('.mkt-step-item');
      stepEls.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.1,
            ease: 'power2.out',
          }
        );
      });
    }, stepsContainerRef);

    return () => ctx.revert();
  }, [activeTab]);

  return (
    <section
      id="marketplace"
      ref={sectionRef}
      className="py-24 lg:py-32 2xl:py-24 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Hero blurb */}
        <div className="mkt-header max-w-3xl mb-24">
          <p className="text-sm uppercase tracking-[0.4em] text-neutral-500 mb-8 font-medium">
            Skillance Marketplace
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-black leading-[1.05] mb-8">
            Courses, documents, and{' '}
            <span className="italic">training material.</span>
          </h2>
          <p className="text-xl text-neutral-500 font-light leading-relaxed max-w-xl">
            Skillance Marketplace is where professionals list and discover digital
            learning — courses, document packs, and training resources. Clear listings,
            secure delivery, and straightforward payouts — built for knowledge, not clutter.
          </p>
        </div>

        {/* Feature cards — editorial grid, no icons */}
        <div className="mkt-cards-grid grid md:grid-cols-3 gap-px bg-neutral-100 rounded-[2rem] overflow-hidden border border-neutral-100 mb-28">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="mkt-card bg-white p-8 lg:p-12 flex flex-col gap-6 group hover:bg-neutral-50/80 transition-colors duration-500"
            >
              <span className="font-serif text-4xl lg:text-5xl text-neutral-200 group-hover:text-neutral-400 transition-colors duration-500">
                {card.number}
              </span>
              <div>
                <h3 className="font-serif text-2xl lg:text-3xl text-black mb-3">{card.title}</h3>
                <p className="text-neutral-500 leading-relaxed font-light">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works — matches site HowItWorks section */}
        <div className="mb-28">
          <div className="mkt-hiw-header flex flex-col items-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 mb-6 font-medium">
              How it works
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl text-black leading-[1.1] mb-10 text-center max-w-2xl">
              Simple steps to{' '}
              <span className="italic">get started.</span>
            </h2>

            <div className="flex bg-neutral-50 p-1.5 rounded-full border border-neutral-100">
              <button
                type="button"
                onClick={() => setActiveTab('buyer')}
                className={`px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 ${
                  activeTab === 'buyer'
                    ? 'bg-black text-white shadow-xl shadow-black/10'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                For Buyers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seller')}
                className={`px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 ${
                  activeTab === 'seller'
                    ? 'bg-black text-white shadow-xl shadow-black/10'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                For Sellers
              </button>
            </div>
          </div>

          <div ref={stepsContainerRef}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeSteps.map((step) => (
                  <div
                    key={step.number + activeTab}
                    className="mkt-step-item border-b border-neutral-100 py-12 sm:py-16 lg:py-20 group hover:bg-neutral-50/50 transition-colors duration-500 rounded-3xl -mx-4 px-4"
                  >
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                      <div className="lg:col-span-2">
                        <span className="font-serif text-5xl lg:text-7xl text-neutral-500 block group-hover:text-black transition-colors duration-500 opacity-80 group-hover:opacity-100">
                          {step.number}
                        </span>
                      </div>

                      <div className="lg:col-span-4 lg:pt-4">
                        <h3 className="font-serif text-3xl lg:text-4xl text-black">
                          {step.title}
                        </h3>
                      </div>

                      <div className="lg:col-span-6 lg:pt-4">
                        <p className="text-lg sm:text-xl text-neutral-500 leading-relaxed font-light max-w-xl group-hover:text-neutral-600 transition-colors duration-500">
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

        {/* CTA strip */}
        <div className="mkt-cta rounded-[2rem] bg-neutral-900 px-10 py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-serif text-3xl sm:text-4xl text-white mb-3">
              Start publishing today.
            </h3>
            <p className="text-neutral-400 font-light leading-relaxed max-w-md">
              Download the Skillance app to list your first course or resource. Available on iOS and Android — free to download, free to list.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <a
              href="#"
              className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-70">GET IT ON</div>
                <div className="text-sm font-medium">Google Play</div>
              </div>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.37 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] opacity-70">Download on</div>
                <div className="text-sm font-medium">App Store</div>
              </div>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MarketplaceSection;
