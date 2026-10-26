import { Link } from 'react-router-dom';
import { BEYOND_EMAIL, PAGES } from '@/beyond/content';
import { BeyondLegalDocument, BeyondLegalSection } from '@/beyond/components/BeyondLegalDocument';
import {
  BEYOND_LEGAL,
  beyondFooterDisclosureBlock,
  formatPriceVatPhrase,
  formatVatRegistrationLine,
} from '@/constants/beyondLegal';
import { CORPORATE_LEGAL_ADDRESS_ONE_LINE } from '@/constants/corporate';
import { useBeyondPage } from '@/beyond/useBeyondPage';

const UPDATED = '26 October 2026';

export default function BeyondTermsPage() {
  useBeyondPage(PAGES.beyondTerms);

  const vatPhrase = formatPriceVatPhrase();

  return (
    <BeyondLegalDocument title="Beyond service terms" updated={UPDATED}>
      <p className="by-legal-lede">
        These terms summarise how Skillance Beyond the App engages on custom software and website projects.
        Each project also has a written proposal or contract; if anything here conflicts with a signed agreement
        for your project, the signed agreement prevails.
      </p>

      <BeyondLegalSection id="beyond-terms-who" title="Who we are">
        <p>{beyondFooterDisclosureBlock()}</p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-proposals" title="Proposals and contracts">
        <p>
          Every project has a written proposal stating scope, price, timeline, and deliverables. You accept it by
          signature or written acceptance (Electronic Communications and Transactions Act, 2002, section 13).
          Change requests outside the agreed scope are quoted at {BEYOND_LEGAL.changeRequestHourlyRate} per hour.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-fees" title="Fees and payment">
        <p>
          A {BEYOND_LEGAL.depositPercent} deposit is due before work starts; the balance is due before go-live.
          Prices are in South African rand ({vatPhrase}) — {formatVatRegistrationLine()}.
          Invoices are payable within {BEYOND_LEGAL.invoicePaymentDays} days unless the proposal says otherwise.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-client" title="Client responsibilities">
        <p>
          You supply content, logos, photos, access credentials, and approvals on time. You warrant that you own or
          may use what you provide and that facts shown on your site (registrations, gradings, prices, claims) are
          accurate and kept current.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-ip" title="Ownership and intellectual property">
        <p>
          When you have paid in full, you own your content, your design, and the delivered website or software we
          built for you. We retain ownership of our reusable starter code and components and grant you a perpetual,
          royalty-free licence to use them in your delivered product. Domains stay registered in your name. Until
          payment is complete, we retain all rights and may withdraw demo or staging sites.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-care" title="Care plans">
        <p>
          Optional monthly care plans ({BEYOND_LEGAL.carePlanNamesAndPrices}) include a fixed amount of edit time that
          does not roll over. We respond within {BEYOND_LEGAL.carePlanResponseBusinessDays} business days on care-plan
          work. Either party may cancel with 30 days&apos; notice. When care ends, we hand over the code repository
          and DNS records within 10 business days unless we agree otherwise in writing.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-third-party" title="Third-party services">
        <p>
          Hosting, forms, email, analytics, and booking tools are provided by third parties on their own terms.
          We are not liable for their outages, policy changes, or pricing.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-liability" title="Liability">
        <p>
          Our aggregate liability for a project is capped at the fees you paid us for that project in the preceding{' '}
          {BEYOND_LEGAL.liabilityCapMonths} months. We do not guarantee search rankings, enquiry volumes, or
          specific business outcomes. Nothing here excludes or limits consumer rights under the Consumer Protection
          Act, 2008 where they apply and cannot be excluded.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-data" title="Data">
        <p>
          When we build or maintain your website, you remain responsible for visitors&apos; personal information and
          we act as your operator. See our{' '}
          <Link to="/beyond/data-processing" className="by-textlink">
            Client data processing
          </Link>{' '}
          summary and the operator agreement signed with your project.
        </p>
      </BeyondLegalSection>

      <BeyondLegalSection id="beyond-terms-disputes" title="Disputes and law">
        <p>
          Contact{' '}
          <a href={`mailto:${BEYOND_EMAIL}`} className="by-textlink">
            {BEYOND_EMAIL}
          </a>{' '}
          first so we can resolve concerns in good faith. These terms are governed by the laws of the Republic of
          South Africa. Notices may be sent to our registered office: {CORPORATE_LEGAL_ADDRESS_ONE_LINE} (domicilium
          citandi et executandi).
        </p>
      </BeyondLegalSection>

      <p className="by-legal-note">
        This page is a summary for transparency. It is not legal advice. Marketplace bookings are covered by the{' '}
        <Link to="/terms" className="by-textlink">
          marketplace terms
        </Link>
        , not these Beyond service terms.
      </p>
    </BeyondLegalDocument>
  );
}
