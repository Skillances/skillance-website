import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { computeSectionScrollTop, getLenisFromWindow, getSectionScrollTopReservePx, getViewportScrollY } from '@/lib/sectionScroll';
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
    const targetReserve = hashTarget ? 0 : getSectionScrollTopReservePx();

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

      const compensatedTop = Math.max(
        0,
        computeSectionScrollTop(element, lenis) - targetReserve
      );

      // Hash-based route navigation must land exactly inside target section.
      if (hashTarget) {
        if (lenis) {
          lenis.scrollTo(compensatedTop, { immediate: true, force: true });
        }
        window.scrollTo({ top: compensatedTop, behavior: 'auto' });

        timeoutId = setTimeout(() => {
          const after = document.getElementById(target);
          if (!after) return;
          const currentLenis = getLenisFromWindow();
          const exactTop = Math.max(
            0,
            after.getBoundingClientRect().top + getViewportScrollY(currentLenis)
          );
          if (currentLenis) currentLenis.scrollTo(exactTop, { immediate: true, force: true });
          window.scrollTo({ top: exactTop, behavior: 'auto' });
        }, 120);
        return;
      }

      if (lenis) {
        lenis.scrollTo(compensatedTop, { duration: 1, force: true });
        // Correct final landing after smooth animation settles.
        timeoutId = setTimeout(() => {
          const after = document.getElementById(target);
          if (!after) return;
          const finalTop = Math.max(
            0,
            computeSectionScrollTop(after, getLenisFromWindow()) - targetReserve
          );
          const currentLenis = getLenisFromWindow();
          if (currentLenis) currentLenis.scrollTo(finalTop, { duration: 0.35, force: true });
          else window.scrollTo({ top: finalTop, behavior: 'smooth' });
        }, 520);
        return;
      }

      if (attempts < 30) {
        timeoutId = setTimeout(scrollToTarget, 80);
        return;
      }

      window.scrollTo({ top: compensatedTop, behavior: 'smooth' });
      timeoutId = setTimeout(() => {
        const after = document.getElementById(target);
        if (!after) return;
        const finalTop = Math.max(0, computeSectionScrollTop(after) - targetReserve);
        window.scrollTo({ top: finalTop, behavior: 'smooth' });
      }, 520);
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
