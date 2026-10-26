import { Link } from 'react-router-dom';
import BeyondFigure from '@/beyond/components/BeyondFigure';
import BeyondHero from '@/beyond/components/BeyondHero';
import BeyondFaqList from '@/beyond/components/BeyondFaq';
import CopyEmailButton from '@/beyond/components/CopyEmailButton';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import BeyondRedesignShowcase from '@/beyond/components/BeyondRedesignShowcase';
import SkillanceCaseStudy from '@/beyond/components/SkillanceCaseStudy';
import { OwnPlatform, SectionHead, StepRows } from '@/beyond/components/Blocks';
import { FAQS, HOME_STORY, PAGES, SERVICES, STEPS } from '@/beyond/content';
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

      <section className="by-section" aria-labelledby="beyond-story-title">
        <div className="by-wrap by-split by-split-media by-reveal">
          <div>
            <SectionHead
              id="beyond-story-title"
              kicker={HOME_STORY.kicker}
              title={HOME_STORY.title}
            />
            {HOME_STORY.paragraphs.map((paragraph) => (
              <p key={paragraph} className="by-story-paragraph">{paragraph}</p>
            ))}
          </div>
          <BeyondFigure
            jpgSrc="/beyond/platform-devices.jpg"
            alt="Skillance product on laptop and phone"
            className="by-figure-section"
            loading="lazy"
          />
        </div>
      </section>

      <section className="by-section by-section-cool by-section-services-index" aria-labelledby="beyond-build-title">
        <div className="by-wrap">
          <SectionHead
            id="beyond-build-title"
            kicker="What we build"
            title="Four ways we help businesses ship software."
            lede="Most projects are one of these four, and plenty are a mix. We scope each one with you before anything is priced."
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

      <BeyondRedesignShowcase />

      <section className="by-section" aria-labelledby="beyond-approach-title">
        <div className="by-wrap by-reveal">
          <SectionHead
            id="beyond-approach-title"
            kicker="How we work"
            title="From first conversation to launch, and after."
            lede="Five stages. You always know what we are doing now and what comes next."
          />
          <StepRows steps={stepRows} />
          <div className="by-actions">
            <Link to="/beyond/approach" className="by-textlink">
              See how we work
            </Link>
          </div>
        </div>
      </section>

      <OwnPlatform />

      <section className="by-section by-section-cool" aria-labelledby="beyond-case-title">
        <div className="by-wrap">
          <SkillanceCaseStudy compact />
        </div>
      </section>

      <section className="by-section" aria-labelledby="beyond-faq-title">
        <div className="by-wrap by-reveal">
          <SectionHead id="beyond-faq-title" kicker="Questions" title="Questions people ask first" />
          <BeyondFaqList items={FAQS} />
        </div>
      </section>

      <section className="by-section by-section-cta" aria-labelledby="beyond-start-title">
        <div className="by-wrap by-section-cta-inner by-reveal">
          <SectionHead
            id="beyond-start-title"
            kicker="Start"
            title="Tell us what you are building."
            lede="Email us with what you want to build and who it is for. We keep it between us."
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
