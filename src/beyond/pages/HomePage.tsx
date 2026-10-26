import { Link } from 'react-router-dom';
import BeyondHero from '@/beyond/components/BeyondHero';
import BeyondFaqList from '@/beyond/components/BeyondFaq';
import CopyEmailButton from '@/beyond/components/CopyEmailButton';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import BeyondRedesignShowcase from '@/beyond/components/BeyondRedesignShowcase';
import { HomeProofMarketplace, HomeProofStory } from '@/beyond/components/HomeProofBand';
import { SectionHead, StepRows } from '@/beyond/components/Blocks';
import { BEYOND_PROCESS_HOME, FAQS, PAGES, SERVICES, STEPS } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function HomePage() {
  useBeyondPage({ ...PAGES.home, faqs: FAQS });

  const stepRows = STEPS.map((step) => ({
    num: step.num,
    title: step.title,
    body: step.summary,
  }));

  return (
    <>
      <BeyondHero titleId="beyond-hero-title" />

      <div className="by-proof-band">
        <HomeProofStory />
        <HomeProofMarketplace />
      </div>

      <BeyondRedesignShowcase />

      <section className="by-section by-section-cool by-section-services-index" aria-labelledby="beyond-build-title">
        <div className="by-wrap">
          <SectionHead
            id="beyond-build-title"
            kicker="What we build"
            title="Five ways we ship software."
            lede="Websites from a free demo; larger builds get a written proposal."
          />
          <ol className="by-index by-index-columns by-reveal">
            {SERVICES.map((service) => (
              <li key={service.id}>
                <Link to={`/beyond/services#${service.id}`}>
                  <span className="by-num">{service.num}</span>
                  <span>
                    <span className="by-index-title">{service.title}</span>
                    <span className="by-index-sum">{service.hero}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="by-actions">
            <Link to="/beyond/services" className="by-textlink">
              See all services
            </Link>
          </div>
        </div>
      </section>

      <section className="by-section" aria-labelledby="beyond-approach-title">
        <div className="by-wrap by-reveal">
          <SectionHead
            id="beyond-approach-title"
            kicker={BEYOND_PROCESS_HOME.kicker}
            title={BEYOND_PROCESS_HOME.title}
            lede={BEYOND_PROCESS_HOME.lede}
          />
          <StepRows steps={stepRows} />
          <div className="by-actions">
            <Link to="/beyond/approach" className="by-textlink">
              Full process detail
            </Link>
          </div>
        </div>
      </section>

      <section className="by-section" aria-labelledby="beyond-faq-title">
        <div className="by-wrap by-reveal">
          <SectionHead id="beyond-faq-title" kicker="FAQ" title="Common questions" />
          <BeyondFaqList items={FAQS} />
        </div>
      </section>

      <section className="by-section by-section-cta" aria-labelledby="beyond-start-title">
        <div className="by-wrap by-section-cta-inner by-reveal">
          <SectionHead
            id="beyond-start-title"
            kicker="Start"
            title="Request a free demo of your site."
            lede="Email services@skillance.co.za with your current website or a short brief. We reply from that inbox only."
          />
          <div className="by-actions by-actions-cta">
            <EnquiryLink ctaLocation="home_close" variant="solid">
              Start a project
            </EnquiryLink>
            <CopyEmailButton ctaLocation="home_close" variant="light" />
          </div>
        </div>
      </section>
    </>
  );
}
