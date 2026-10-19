import { Link } from 'react-router-dom';
import EnquiryLink from '@/beyond/components/EnquiryLink';
import { PageIntro } from '@/beyond/components/Blocks';
import { BEYOND_EMAIL, PAGES } from '@/beyond/content';
import { useBeyondPage } from '@/beyond/useBeyondPage';

export default function ContactPage() {
  useBeyondPage(PAGES.contact);

  return (
    <div className="by-wrap">
      {/* TODO(beyond): A project enquiry form needs a backend endpoint and a POPIA-compliant
          privacy notice before it can collect any personal information. Do not add inputs here. */}
      <PageIntro
        kicker="Contact"
        title="Start a project by email."
        lede="Tell us what you want to build, who it is for, and any timing you already know. This page has no form, and the website does not store your message."
      />
      <section className="by-section by-section-follow" aria-labelledby="contact-email">
        <h2 id="contact-email" className="by-sr">
          Email
        </h2>
        <p className="by-contact-email">{BEYOND_EMAIL}</p>
        <div className="by-actions">
          <EnquiryLink ctaLocation="contact_page">Email a project enquiry</EnquiryLink>
        </div>
        <p className="by-note">
          The button opens your email app with the subject already filled in. If it does not, copy the address above.
          Nothing is submitted to Skillance from this page.
        </p>
        <p className="by-note">
          A proper enquiry form, with a POPIA notice, needs a backend endpoint before it can collect a name or an
          email address. Until then, email is the path.{' '}
          <Link to="/privacy-policy" className="by-textlink">
            Read the privacy policy
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
