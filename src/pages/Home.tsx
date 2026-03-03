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

const Home = () => {
  return (
    <>
      <Hero />
      <Mission />
      <Services />
      <HowItWorks />
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
