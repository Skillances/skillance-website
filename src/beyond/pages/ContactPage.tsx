import { Link } from 'react-router-dom';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import CopyEmailButton from '@/beyond/components/CopyEmailButton';
import { PageIntro } from '@/beyond/components/Blocks';
import { BEYOND_EMAIL, PAGES } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ContactPage() {
  useBeyondPage(PAGES.contact);

  return (
    <div className="by-wrap">
      <PageIntro
        kicker="Contact"
        title="Tell us what you are building."
        lede="Email us with what you want to build, who it is for, and any timing you already know. We keep it between us."
      />
      <section className="by-section by-section-follow" aria-labelledby="contact-email">
        <h2 id="contact-email" className="by-sr">
          Email
        </h2>
        <p className="by-contact-email">{BEYOND_EMAIL}</p>
        <div className="by-actions">
          <EnquiryLink ctaLocation="contact_page">Start a project</EnquiryLink>
          <CopyEmailButton ctaLocation="contact_page" variant="light" />
        </div>
        <p className="by-note">
          Prefer your own email app? Copy the address above or use the button.{' '}
          <Link to="/privacy-policy" className="by-textlink">
            Privacy policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
