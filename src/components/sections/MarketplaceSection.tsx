import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Feature Cards ────────────────────────────────────────────────────────────

const featureCards = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'List in minutes',
    description:
      'Take photos, set a price, and go live. Your listing reaches local buyers instantly.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Browse locally',
    description:
      'Discover items near you. Filter by category, condition, and price to find exactly what you need.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Safe & transparent',
    description:
      'Only 5% fee on successful sales. No surprises, no subscriptions — just straightforward commerce.',
  },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────

const buyerSteps = [
  {
    number: '01',
    title: 'Browse & discover',
    description: 'Search listings near you. Filter by category, condition, and price range to find exactly what you want.',
  },
  {
    number: '02',
    title: 'Contact the seller',
    description: 'Message sellers directly inside the app. Ask questions, negotiate, and arrange a meeting safely.',
  },
  {
    number: '03',
    title: 'Complete the deal',
    description: 'Meet locally or arrange delivery. Confirm receipt in the app so the transaction is recorded.',
  },
];

const sellerSteps = [
  {
    number: '01',
    title: 'Create your listing',
    description: 'Snap a few photos, write a short description, set your price, and publish. The whole process takes under two minutes.',
  },
  {
    number: '02',
    title: 'Receive enquiries',
    description: 'Interested buyers message you directly. Chat, answer questions, and agree on terms — all in one place.',
  },
  {
    number: '03',
    title: 'Get paid',
    description: 'Complete the sale and receive payment. We charge just 5% on success — no listing fees, no monthly subscriptions.',
  },
];

// ─── Divider Banner ───────────────────────────────────────────────────────────

export const MarketplaceDivider = () => (
  <div className="w-full bg-neutral-900 py-10 px-6 lg:px-8 overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-black text-xs font-semibold uppercase tracking-widest shrink-0">
          New
        </span>
        <p className="font-serif text-2xl sm:text-3xl text-white text-center sm:text-left">
          Introducing:{' '}
          <span className="italic text-amber-400">Skillance Marketplace</span>
        </p>
      </div>
      <p className="text-sm text-neutral-400 text-center sm:text-right max-w-xs">
        Also in the Skillance app — a completely different kind of platform.
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

  // Scroll-reveal: header + feature cards
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

  // Re-animate steps when tab changes
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
      className="py-24 lg:py-32 2xl:py-24 bg-amber-50 overflow-hidden"
      style={{ scrollMarginTop: '152px' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* ── Hero Blurb ── */}
        <div className="mkt-header max-w-3xl mb-24">
          <p className="text-sm uppercase tracking-[0.4em] text-amber-600 mb-8 font-medium">
            Skillance Marketplace
          </p>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-black leading-[1.05] mb-8">
            Buy and sell{' '}
            <span className="italic">anything, locally.</span>
          </h2>
          <p className="text-xl text-neutral-600 font-light leading-relaxed max-w-xl">
            Skillance Marketplace is a place to list and discover second-hand goods,
            preloved items, and everyday essentials in your community. No clutter,
            no middlemen — just people trading locally.
          </p>
        </div>

        {/* ── Feature Cards ── */}
        <div className="mkt-cards-grid grid md:grid-cols-3 gap-6 lg:gap-8 mb-28">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="mkt-card rounded-2xl bg-white border border-amber-200 shadow-sm shadow-amber-100 p-8 lg:p-10 flex flex-col gap-5 hover:shadow-md hover:shadow-amber-200 transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                {card.icon}
              </div>
              <div>
                <h3 className="font-serif text-2xl text-black mb-3">{card.title}</h3>
                <p className="text-neutral-500 leading-relaxed font-light">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── How It Works ── */}
        <div className="mb-28">
          {/* Sub-header */}
          <div className="mkt-hiw-header flex flex-col items-center mb-16">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-600 mb-6 font-medium">
              How it works
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl text-black leading-[1.1] mb-10 text-center max-w-2xl">
              Simple steps to{' '}
              <span className="italic">start trading.</span>
            </h2>

            {/* Tab Switcher — amber variant */}
            <div className="flex bg-amber-100 p-1.5 rounded-full border border-amber-200">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 ${
                  activeTab === 'buyer'
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                For Buyers
              </button>
              <button
                onClick={() => setActiveTab('seller')}
                className={`px-8 py-3.5 rounded-full text-sm font-medium transition-all duration-500 ${
                  activeTab === 'seller'
                    ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                For Sellers
              </button>
            </div>
          </div>

          {/* Steps */}
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
                    className="mkt-step-item border-b border-amber-200 py-12 sm:py-16 lg:py-20 group hover:bg-amber-100/40 transition-colors duration-500 rounded-3xl -mx-4 px-4"
                  >
                    <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                      {/* Number */}
                      <div className="lg:col-span-2">
                        <span className="font-serif text-5xl lg:text-7xl text-amber-300 block group-hover:text-amber-500 transition-colors duration-500">
                          {step.number}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="lg:col-span-4 lg:pt-4">
                        <h3 className="font-serif text-3xl lg:text-4xl text-black">
                          {step.title}
                        </h3>
                      </div>

                      {/* Description */}
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

        {/* ── CTA Strip ── */}
        <div className="mkt-cta rounded-3xl bg-amber-500 px-10 py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-serif text-3xl sm:text-4xl text-white mb-3">
              Start selling today.
            </h3>
            <p className="text-amber-100 font-light leading-relaxed max-w-md">
              Download the Skillance app to list your first item. Available on iOS and Android — free to download, free to list.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <a
              href="#"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-white text-amber-600 text-sm font-semibold hover:bg-amber-50 transition-colors shadow-lg shadow-amber-600/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-700/20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.18 23.76c.3.17.65.19.98.07l12.76-7.36-2.78-2.78-10.96 10.07zM.36 1.19A1.5 1.5 0 000 2.14v19.72c0 .38.13.73.36 1.01L.44 23l11.05-11.05v-.26L.44 1.12l-.08.07zM21.54 10.27l-2.79-1.61-3.12 3.12 3.12 3.13 2.82-1.63c.8-.46.8-1.55-.03-2.01zM4.16.24L16.92 7.6l-2.78 2.78L3.18.31a1.1 1.1 0 01.98-.07z"/>
              </svg>
              Google Play
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default MarketplaceSection;
