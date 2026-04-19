import { Link } from 'react-router-dom';
import PageTemplate from '../../components/layout/PageTemplate';

const Privacy = () => {
  return (
    <PageTemplate title="Privacy Policy" animateSections>
      <div className="space-y-10 text-neutral-600">
        <div className="space-y-3">
          <p className="text-xl leading-relaxed italic text-black/80">Last updated: 19 April 2026</p>
          <p className="text-sm leading-relaxed text-neutral-500">
            This Privacy Policy explains how personal information is processed through the Skillance website and mobile apps
            on iOS and Android (the &quot;Platform&quot;). It should be read with our{' '}
            <Link to="/cookie-policy" className="text-black underline underline-offset-4 hover:no-underline">Cookie Policy</Link>,{' '}
            <Link to="/terms" className="text-black underline underline-offset-4 hover:no-underline">Terms of Service</Link> and{' '}
            <Link to="/refund-policy" className="text-black underline underline-offset-4 hover:no-underline">Refund Policy</Link>.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">1. Who is responsible (Responsible Party)</h2>
          <p className="leading-relaxed">
            The responsible party under the Protection of Personal Information Act, 2013 (&quot;POPIA&quot;) is{' '}
            <strong className="text-black">RIMITSO MANAGEMENT SERVICES (PTY) LTD</strong>, trading as Skillance, a company
            registered in the Republic of South Africa.
          </p>
          <p className="leading-relaxed">
            For privacy queries, to exercise POPIA rights, or to contact our information officer, email{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>{' '}
            or WhatsApp{' '}
            <a
              href="https://wa.me/27648728174"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-4 hover:no-underline"
            >
              +27 64 872 8174
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">2. Scope</h2>
          <p className="leading-relaxed">
            This policy applies to personal information we collect when you visit our website, use our mobile apps, contact
            us, or otherwise interact with Skillance as a customer, Freelancer, visitor, or prospective user.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">3. Information we collect</h2>
          <p className="leading-relaxed mb-3">We collect the following categories:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Account data:</strong> name, email, phone number, password hash, profile photo,
              date of birth where required, role (customer / freelancer).
            </li>
            <li>
              <strong className="text-black">Freelancer profile data:</strong> bio, skills, rates, categories, portfolio
              content, service locations, availability, certifications.
            </li>
            <li>
              <strong className="text-black">Identity and safety data:</strong> government-issued ID or passport (and photos
              of the document), a selfie for verification, police clearance where required for certain categories. This is
              &quot;special&quot; or sensitive personal information under POPIA and is handled accordingly.
            </li>
            <li>
              <strong className="text-black">Booking and commerce data:</strong> bookings, invoices, platform commission on
              completed bookings (<strong className="text-black">8–9% including VAT</strong> unless otherwise agreed),
              connection fee payments (R50, non-refundable), session PIN evidence, session duration, disputes, cancellations.
            </li>
            <li>
              <strong className="text-black">Payment data:</strong> processed by our payment provider (currently WalletDoc);
              we store limited transaction metadata (such as amounts, status, last-4 where provided) but not full card
              numbers.
            </li>
            <li>
              <strong className="text-black">Communications:</strong> in-app chat messages, support emails, WhatsApp
              conversations when you contact us, notification preferences.
            </li>
            <li>
              <strong className="text-black">Reviews and ratings.</strong>
            </li>
            <li>
              <strong className="text-black">Location:</strong> city and approximate coordinates; precise device location
              only when you enable proximity search or a feature that requires it, based on your device permissions.
            </li>
            <li>
              <strong className="text-black">Device and usage data:</strong> device identifiers, IP address, user-agent,
              crash logs, page views, clicks, diagnostic events, cookies and similar technologies (see Cookie Policy).
            </li>
            <li>
              <strong className="text-black">Compliance and audit data:</strong> consent records (including cookie decisions,
              policy version, timestamp, IP, user-agent), security logs, moderation events on user-generated content.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">4. Why we process your information and our lawful basis</h2>
          <p className="leading-relaxed mb-3">
            Under POPIA we rely on one or more of the following grounds for processing (section 11): performance of a
            contract with you; compliance with a legal obligation; pursuit of our legitimate interests (balanced against your
            rights); and, where required, your consent.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To register you, maintain your account, and provide the Platform (contract, legitimate interests).</li>
            <li>To enable bookings, chat, invoicing, payments, escrow, session PIN, disputes, and reviews (contract).</li>
            <li>To verify identity, run safety and fraud checks, and protect users (legal obligation, legitimate interests).</li>
            <li>To moderate user-generated content and enforce our Terms (legitimate interests, legal obligation).</li>
            <li>To send transactional messages (bookings, receipts, safety notices) by email, in-app and push (contract).</li>
            <li>To send marketing or newsletters where you have opted in or where allowed as soft opt-in under ECTA (consent, legitimate interests); you can opt out at any time.</li>
            <li>To perform analytics, improve, and secure the Platform (legitimate interests, subject to cookie choices).</li>
            <li>To meet tax, accounting, regulatory, and audit obligations (legal obligation).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">5. Children</h2>
          <p className="leading-relaxed">
            The Platform is intended for adults. You must be at least 18 years old to create an account. We do not knowingly
            collect personal information from children under 18 without appropriate parental or guardian consent where
            required. If you believe a child has provided us information, contact us and we will take appropriate steps.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">6. Sharing and operators (processors)</h2>
          <p className="leading-relaxed">
            We do not sell your personal information. We share information only as needed to run the Platform and as
            described here:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Between users:</strong> profile details, reviews, and booking-relevant
              information are shared between the customer and the Freelancer involved in a booking.
            </li>
            <li>
              <strong className="text-black">Payment processing:</strong> WalletDoc processes payments, refunds, and the R50
              connection fee and may share limited transaction data with us.
            </li>
            <li>
              <strong className="text-black">Infrastructure and analytics operators:</strong> cloud hosting, database,
              search, error reporting, analytics (Google), tag manager (Google Tag Manager with Consent Mode), maps (Mapbox),
              realtime messaging (Ably and/or Pusher-compatible services), email delivery, and push notification services.
            </li>
            <li>
              <strong className="text-black">Identity and verification services</strong> where we use them to help verify
              Freelancers.
            </li>
            <li>
              <strong className="text-black">Professional advisers</strong> (accountants, auditors, insurers, lawyers) under
              duties of confidentiality.
            </li>
            <li>
              <strong className="text-black">Law enforcement, regulators, and courts</strong> where we reasonably believe we
              are legally required to disclose, or where necessary to establish, exercise, or defend a legal claim, or to
              protect the safety of users or the public.
            </li>
            <li>
              <strong className="text-black">Corporate events</strong> such as a merger, acquisition, reorganisation, or sale
              of assets, subject to equivalent protections.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">7. Cross-border transfers</h2>
          <p className="leading-relaxed">
            Some operators we use may process personal information outside South Africa (for example, Google services). When
            this happens we rely on POPIA Chapter 9 protections, including binding contractual safeguards with operators,
            their regulatory compliance programmes, and where applicable your consent. You can contact us for more detail on
            specific transfers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">8. Retention</h2>
          <p className="leading-relaxed mb-3">
            We retain personal information only as long as necessary for the purposes set out above or as required by law.
            Typical retention periods are:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Active account and profile data: while your account is active.</li>
            <li>
              Booking, invoice, platform commission (8–9% including VAT on completed bookings unless otherwise agreed), and
              connection fee records: for the period required by tax and accounting law (generally at least 5 years from the
              end of the relevant financial year).
            </li>
            <li>Chat messages and moderation records: retained for safety, dispute, and compliance purposes (e.g. 90 days for routine moderation, longer for active investigations).</li>
            <li>Identity verification documents: retained for the period required to evidence verification, then deleted or anonymised.</li>
            <li>Security logs and audit logs (including cookie consent records): retained for a limited period (e.g. approximately 90 days for security, longer for consent records that serve as proof of lawful processing).</li>
            <li>Performance metrics and diagnostics: retained for a limited period (e.g. approximately 30 days).</li>
          </ul>
          <p className="leading-relaxed">
            On account deletion we delete or anonymise personal information, except where retention is required (for example,
            financial records, dispute evidence, audit logs, or legal hold). See Terms section 16 and section 11 below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">9. Security</h2>
          <p className="leading-relaxed">
            We apply reasonable technical and organisational measures to safeguard personal information, including encryption
            in transit, access controls, segregated environments, auditing, rate limiting, content moderation, and incident
            response processes. No system is completely secure; you are responsible for protecting your credentials and
            devices.
          </p>
          <p className="leading-relaxed">
            If a security compromise affecting personal information occurs, we will notify the Information Regulator and
            affected users as required by POPIA section 22.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">10. Your rights under POPIA</h2>
          <p className="leading-relaxed mb-3">Subject to POPIA and other applicable law, you may:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>request confirmation of whether we hold personal information about you;</li>
            <li>request access to your personal information;</li>
            <li>request correction or deletion of information that is inaccurate, misleading, outdated, incomplete, excessive, or unlawfully obtained;</li>
            <li>object to, or withdraw consent for, processing that is based on consent or legitimate interests, on reasonable grounds;</li>
            <li>object to processing for direct marketing;</li>
            <li>request that we stop using your information for a specific purpose (where permitted);</li>
            <li>lodge a complaint with the{' '}
              <a
                href="https://inforegulator.org.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black underline underline-offset-4 hover:no-underline"
              >
                Information Regulator (South Africa)
              </a>
              .
            </li>
          </ul>
          <p className="leading-relaxed">
            To exercise rights, contact us as in section 1. For formal access requests, we may require completion of POPIA
            Form 2 (prescribed access request) and identity verification before we respond, as the Act contemplates.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">11. Account deletion</h2>
          <p className="leading-relaxed">
            You can delete your account from within the app (Settings), via the website profile, or by emailing{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>
            . Upon deletion, profile data and non-essential personal information are removed or anonymised. Certain records
            may be retained in line with section 8 (legal, tax, audit, dispute).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">12. Cookies, analytics, and advertising technologies</h2>
          <p className="leading-relaxed">
            We use cookies and similar technologies, including Google Tag Manager configured with Google Consent Mode. We do
            not load non-essential analytics or marketing tags before you grant consent. See our{' '}
            <Link to="/cookie-policy" className="text-black underline underline-offset-4 hover:no-underline">Cookie Policy</Link>{' '}
            for details and how to change your choices.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">13. Data we disclose in store listings (Data Safety / Privacy Nutrition Label)</h2>
          <p className="leading-relaxed">
            To meet Apple App Store (Privacy Nutrition Labels) and Google Play (Data Safety) expectations, we maintain
            accurate disclosures in each store of the data types we collect, why, whether they are linked to you, and whether
            they are used for tracking. We review these before each release. Contact us if you believe a disclosure in a
            store listing is incorrect.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">14. Changes to this policy</h2>
          <p className="leading-relaxed">
            We may update this policy to reflect changes to the Platform, our practices, or the law. Material changes will be
            communicated on the Platform and may be accompanied by a bump in our policy version (recorded in consent audit
            logs).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">15. Contact</h2>
          <p className="leading-relaxed">
            RIMITSO MANAGEMENT SERVICES (PTY) LTD (Skillance). Email{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>{' '}
            or WhatsApp{' '}
            <a
              href="https://wa.me/27648728174"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-4 hover:no-underline"
            >
              +27 64 872 8174
            </a>
            .
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            This policy is for transparency. It is not legal advice. If you need advice tailored to your circumstances,
            consult a qualified attorney.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Privacy;
