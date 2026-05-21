import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getLenisFromWindow, scrollToPageSection } from '@/lib/sectionScroll';
import Hero from '../components/sections/Hero';
import Mission from '../components/sections/Mission';
import Services from '../components/sections/Services';
import HowItWorks from '../components/sections/HowItWorks';
import TrustSafety from '../components/sections/TrustSafety';
import Stats from '../components/sections/Stats';
import MarketplaceSection, { MarketplaceDivider } from '../components/sections/MarketplaceSection';
import Testimonials from '../components/sections/Testimonials';
import FAQ from '../components/sections/FAQ';
import Reviews from '../components/sections/Reviews';
import CTA from '../components/sections/CTA';

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    const hashTarget = location.hash.startsWith('#') ? location.hash.slice(1) : null;
    const storedTarget = sessionStorage.getItem('skillance_scroll_to');
    const target = hashTarget || storedTarget;
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (storedTarget) sessionStorage.removeItem('skillance_scroll_to');

    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scrollToTarget = () => {
      attempts += 1;
      const element = document.getElementById(target);
      const lenis = getLenisFromWindow();

      if (!element) {
        if (attempts < 30) timeoutId = setTimeout(scrollToTarget, 80);
        return;
      }

      if (!lenis && attempts < 30) {
        timeoutId = setTimeout(scrollToTarget, 80);
        return;
      }

      scrollToPageSection(element, lenis, { immediate: Boolean(hashTarget) });
    };

    timeoutId = setTimeout(scrollToTarget, 380);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.hash]);

  return (
    <>
      <Hero />
      <Mission />
      <HowItWorks />
      <Services />
      <TrustSafety />
      <Stats />
      <MarketplaceDivider />
      <MarketplaceSection />
      <Testimonials />
      <FAQ />
      <Reviews />
      <CTA />
    </>
  );
};

export default Home;
