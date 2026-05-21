import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealFromTo } from '@/lib/motion';
import {
  ShoppingBag,
  Tag,
  Shield,
  Search,
  MessageCircle,
  CheckCircle,
  Camera,
  Users,
  Package,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Tag,
    title: 'List anything local',
    description:
      'Post furniture, electronics, vehicles, and more with photos, price, condition, and location — free to list in the Marketplace app.',
  },
  {
    icon: Search,
    title: 'Browse near you',
    description:
      'Search and filter listings in your area, save favorites, and open full detail pages before you reach out to a seller.',
  },
  {
    icon: Shield,
    title: 'One trusted account',
    description:
      'Buyers and sellers use the same Skillance login as the services app. Verified profiles help you know who you are dealing with.',
  },
];

const buyerSteps = [
  {
    icon: Search,
    title: 'Browse & discover',
    description:
      'Open Skillance Marketplace, search by category or keyword, and explore listings with photos, price, and location.',
  },
  {
    icon: MessageCircle,
    title: 'View & connect',
    description:
      'Open a listing to see the full description and seller profile. Agree pickup or delivery directly with the seller (in-app messaging is on the way).',
  },
  {
    icon: CheckCircle,
    title: 'Meet & complete',
    description:
      'Inspect the item in person when you can, pay as you and the seller agree, and complete the deal locally.',
  },
];

const sellerSteps = [
  {
    icon: Camera,
    title: 'Create a listing',
    description:
      'Snap photos, set your price and condition, add a short description, and publish — your listing goes live in the Marketplace app.',
  },
  {
    icon: Users,
    title: 'Get interest',
    description:
      'Buyers browse your listing, save it to favorites, and reach out when they are ready to buy.',
  },
  {
    icon: Package,
    title: 'Close the sale',
    description:
      'Arrange handover or delivery with the buyer, then mark the listing sold when the item has changed hands.',
  },
];

const MarketplaceSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const elements = contentRef.current?.querySelectorAll('.scroll-reveal');
      elements?.forEach((el) => {
        revealFromTo(el, el, reducedMotion);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const steps = activeTab === 'buyer' ? buyerSteps : sellerSteps;

  return (
    <section
      id="marketplace"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 uw:max-w-[120rem] uw:px-20">
        <div ref={contentRef}>
          {/* Header */}
          <div className="text-center mb-20 uw:mb-32">
            <div className="scroll-reveal inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full mb-6 uw:px-8 uw:py-4 uw:mb-12">
              <ShoppingBag className="w-4 h-4 text-neutral-600 uw:w-8 uw:h-8" />
              <span className="text-sm font-medium text-neutral-700 uw:text-xl">
                Skillance Marketplace
              </span>
            </div>
            <h2 className="scroll-reveal font-serif text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1] mb-6 uw:text-[10rem] uw:mb-12">
              Buy and sell from people{' '}
              <span className="italic">you can trust.</span>
            </h2>
            <p className="scroll-reveal text-lg text-neutral-600 max-w-2xl mx-auto uw:text-3xl uw:max-w-5xl">
              A dedicated classifieds app for local goods — separate from booking freelancers on
              Skillance Personal, with the same secure Skillance account.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-24 uw:gap-16 uw:mb-40">
            {features.map((feature, index) => (
              <div
                key={index}
                className="scroll-reveal p-8 bg-neutral-50 rounded-2xl uw:p-16 uw:rounded-3xl"
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 uw:w-24 uw:h-24 uw:rounded-2xl uw:mb-12">
                  <feature.icon className="w-6 h-6 text-white uw:w-12 uw:h-12" />
                </div>
                <h3 className="font-serif text-xl text-black mb-3 uw:text-4xl uw:mb-6">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed uw:text-2xl">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* How It Works */}
          <div className="mb-24 uw:mb-40">
            <div className="text-center mb-12 uw:mb-24">
              <h3 className="scroll-reveal font-serif text-3xl sm:text-4xl text-black mb-4 uw:text-7xl uw:mb-8">
                How it works
              </h3>
              <p className="scroll-reveal text-neutral-600 uw:text-2xl">
                Whether you are clearing out the garage or hunting for a deal nearby.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="scroll-reveal flex justify-center gap-4 mb-12 uw:gap-8 uw:mb-24">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all uw:px-12 uw:py-6 uw:text-xl ${
                  activeTab === 'buyer'
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                For Buyers
              </button>
              <button
                onClick={() => setActiveTab('seller')}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all uw:px-12 uw:py-6 uw:text-xl ${
                  activeTab === 'seller'
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                For Sellers
              </button>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 uw:gap-16">
              {steps.map((step, index) => (
                <div key={index} className="scroll-reveal text-center">
                  <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6 uw:w-32 uw:h-32 uw:rounded-3xl uw:mb-12">
                    <step.icon className="w-8 h-8 text-black uw:w-16 uw:h-16" />
                  </div>
                  <div className="text-sm text-neutral-400 mb-2 uw:text-xl uw:mb-4">
                    Step {index + 1}
                  </div>
                  <h4 className="font-serif text-xl text-black mb-3 uw:text-4xl uw:mb-6">
                    {step.title}
                  </h4>
                  <p className="text-neutral-600 leading-relaxed uw:text-2xl">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="scroll-reveal text-center p-12 bg-black rounded-3xl uw:p-24 uw:rounded-[3rem]">
            <h3 className="font-serif text-3xl sm:text-4xl text-white mb-4 uw:text-7xl uw:mb-8">
              {activeTab === 'buyer' ? 'Find your next local deal.' : 'List your first item today.'}
            </h3>
            <p className="text-neutral-400 mb-8 max-w-xl mx-auto uw:text-2xl uw:max-w-3xl uw:mb-16">
              {activeTab === 'buyer'
                ? 'Download Skillance Marketplace to browse classifieds near you — same login as Skillance Personal.'
                : 'Download Skillance Marketplace to publish listings, manage photos, and mark items sold when you are done.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center uw:gap-8">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white text-black rounded-xl hover:bg-neutral-100 transition-colors uw:px-12 uw:py-6 uw:rounded-2xl"
              >
                <svg className="w-6 h-6 uw:w-12 uw:h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-neutral-500 uw:text-lg">Download on the</div>
                  <div className="text-sm font-medium uw:text-2xl">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white text-black rounded-xl hover:bg-neutral-100 transition-colors uw:px-12 uw:py-6 uw:rounded-2xl"
              >
                <svg className="w-6 h-6 uw:w-12 uw:h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-neutral-500 uw:text-lg">Get it on</div>
                  <div className="text-sm font-medium uw:text-2xl">Google Play</div>
                </div>
              </a>
            </div>
            <p className="mt-6 text-sm text-neutral-500 uw:text-xl uw:mt-12">
              Need to book a freelancer? Use the Skillance Personal app — marketplace listings live
              in Skillance Marketplace only.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const MarketplaceDivider = () => (
  <div className="relative py-16 lg:py-20 bg-neutral-50 overflow-hidden uw:py-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 uw:max-w-[120rem] uw:px-20">
      <div className="flex items-center gap-6 uw:gap-12">
        <div className="flex-1 h-px bg-neutral-200" />
        <p className="text-sm text-neutral-500 whitespace-nowrap uw:text-xl">
          Local classifieds in Skillance Marketplace — same account, separate app from services.
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
    </div>
  </div>
);

export default MarketplaceSection;
