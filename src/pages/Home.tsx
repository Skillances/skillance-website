import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSectionId } from '@/lib/sectionScroll';
import Hero from '../components/sections/Hero';
import Mission from '../components/sections/Mission';
import Services from '../components/sections/Services';
import HowItWorks from '../components/sections/HowItWorks';
import TrustSafety from '../components/sections/TrustSafety';
import Stats from '../components/sections/Stats';
import Testimonials from '../components/sections/Testimonials';
import FAQ from '../components/sections/FAQ';
import Reviews from '../components/sections/Reviews';
import CTA from '../components/sections/CTA';
import { SITE_META_DESCRIPTION, SITE_META_TITLE } from '@/constants/siteMeta';

function setMetaContent(selector: string, content: string) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = SITE_META_TITLE;
    setMetaContent('meta[name="description"]', SITE_META_DESCRIPTION);
    setMetaContent('meta[name="title"]', SITE_META_TITLE);
    setMetaContent('meta[property="og:title"]', SITE_META_TITLE);
    setMetaContent('meta[property="og:description"]', SITE_META_DESCRIPTION);
    setMetaContent('meta[name="twitter:title"]', SITE_META_TITLE);
    setMetaContent('meta[name="twitter:description"]', SITE_META_DESCRIPTION);
  }, []);

  useEffect(() => {
    const hashTarget = location.hash.startsWith('#') ? location.hash.slice(1) : null;
    const storedTarget = sessionStorage.getItem('skillance_scroll_to');
    const target = hashTarget || storedTarget;
    if (!target) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (storedTarget) sessionStorage.removeItem('skillance_scroll_to');

    return scrollToSectionId(target, { immediate: Boolean(hashTarget), delayMs: 380 });
  }, [location.hash]);

  return (
    <>
      <Hero />
      <Mission />
      <HowItWorks />
      <Services />
      <TrustSafety />
      <Stats />
      <Testimonials />
      <FAQ />
      <Reviews />
      <CTA />
    </>
  );
};

export default Home;
