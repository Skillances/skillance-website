import { BEYOND_EMAIL, PAGES } from '@/beyond/content';
import { BeyondLegalDocument, BeyondLegalSection } from '@/beyond/components/BeyondLegalDocument';
import { BEYOND_LEGAL } from '@/constants/beyondLegal';
import { useBeyondPage } from '@/beyond/useBeyondPage';

const UPDATED = '26 October 2026';

export default function BeyondDataProcessingPage() {
  useBeyondPage(PAGES.beyondDataProcessing);

  return (
    <BeyondLegalDocument title="Client data processing" updated={UPDATED}>
      <p className="by-legal-lede">
        When we build or look after your website or custom software, your business remains the responsible party for
        personal information your visitors or users submit. We process that information only as your operator under
        POPIA sections 20–21 and a written operator agreement signed with every Beyond project.
      </p>

      <BeyondLegalSection id="beyond-dp-commitments" title="What our operator agreement commits us to">
        <ul className="by-legal-list">
          <li>Process personal information only on your documented instructions.</li>
          <li>Keep it confidential and limit access to people who need it for your project.</li>
          <li>
            Secure accounts with two-factor authentication and least-privilege access to hosting, forms, and
            repositories.
          </li>
          <li>
            Use sub-operators only where agreed — typically Cloudflare (hosting and cookieless analytics), Formspree
            (forms), GitHub (code), and Google or Zoho (email, where you choose them). Some process data outside
            South Africa under data-processing agreements (POPIA section 72).
          </li>
          <li>
            Notify you {BEYOND_LEGAL.breachNotifyWindow} of any suspected compromise affecting your project data so
            you can meet your duties to the Information Regulator and affected people.
          </li>
          <li>Help you respond to access and correction requests that relate to data we hold for your project.</li>
          <li>Return or delete project data when we stop working together, subject to legal retention we must keep.</li>
        </ul>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-dp-request" title="Request a copy">
        <p>
          Email{' '}
          <a href={`mailto:${BEYOND_EMAIL}`} className="by-textlink">
            {BEYOND_EMAIL}
          </a>{' '}
          to request our standard operator agreement or to discuss how we handle your project&apos;s data.
        </p>
      </BeyondLegalSection>

      <p className="by-legal-note">
        This summary does not replace the signed operator agreement for your project. Skillance marketplace users
        should read the{' '}
        <a href="/privacy-policy" className="by-textlink">
          Privacy Policy
        </a>{' '}
        for platform processing.
      </p>
    </BeyondLegalDocument>
  );
}
