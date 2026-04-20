import { Link } from 'react-router-dom';
import PageTemplate from '../../components/layout/PageTemplate';

const Terms = () => {
  return (
    <PageTemplate title="Terms of Service" animateSections>
      <div className="space-y-10 text-neutral-600">
        <div className="space-y-3">
          <p className="text-xl leading-relaxed italic text-black/80">Last updated: 19 April 2026</p>
          <p className="text-sm leading-relaxed text-neutral-500">
            These Terms of Service (&quot;Terms&quot;) govern use of the Skillance website at{' '}
            <a
              href="https://skillance.co.za"
              className="text-black underline underline-offset-4 hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              skillance.co.za
            </a>{' '}
            and the Skillance mobile applications distributed on the Apple App Store and Google Play (together, the
            &quot;Platform&quot;). Please read them together with our{' '}
            <Link to="/privacy-policy" className="text-black underline underline-offset-4 hover:no-underline">
              Privacy Policy
            </Link>
            , <Link to="/cookie-policy" className="text-black underline underline-offset-4 hover:no-underline">Cookie Policy</Link> and{' '}
            <Link to="/refund-policy" className="text-black underline underline-offset-4 hover:no-underline">Refund Policy</Link>.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">1. About Skillance and the operator</h2>
          <p className="leading-relaxed">
            Skillance is a South African two-sided marketplace that connects customers with independent service providers
            (&quot;Freelancers&quot;) for services such as tutoring and home services. The Platform is operated by{' '}
            <strong className="text-black">RIMITSO MANAGEMENT SERVICES (PTY) LTD</strong> (&quot;Skillance&quot;,
            &quot;we&quot;, &quot;us&quot;), a company registered in the Republic of South Africa.
          </p>
          <p className="leading-relaxed">
            Contact us at{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>{' '}
            or{' '}
            <a
              href="https://wa.me/27648728174"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black underline underline-offset-4 hover:no-underline"
            >
              WhatsApp +27 64 872 8174
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">2. Acceptance and changes</h2>
          <p className="leading-relaxed">
            By creating an account, accessing, or using the Platform, you confirm that you have read, understood, and agreed
            to these Terms. If you do not agree, do not use the Platform.
          </p>
          <p className="leading-relaxed">
            We may update these Terms from time to time. Material changes will be highlighted on the Platform or notified by
            email or in-app where appropriate. Continued use after the effective date means you accept the updated Terms. If
            you do not accept a change, you may stop using the Platform and request account deletion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">3. Who may use the Platform</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must be at least 18 years old and have the legal capacity to enter into a binding contract.</li>
            <li>You must be lawfully entitled to use the Platform and the services listed on it in your jurisdiction.</li>
            <li>
              Freelancers must have the legal right to provide the services they list (for example, lawful residence or work
              rights in South Africa, relevant licences or qualifications where legally required).
            </li>
            <li>
              You must provide accurate, current, and complete registration information and keep it up to date.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">4. What Skillance is and is not</h2>
          <p className="leading-relaxed">
            Skillance is an <strong className="text-black">online marketplace and intermediary</strong>. We provide
            technology that lets customers discover Freelancers and lets Freelancers list services, take bookings, and
            communicate with customers. Each service is supplied by the Freelancer directly to the customer under a separate
            contract between them.
          </p>
          <p className="leading-relaxed">
            <strong className="text-black">We are not a party</strong> to the service contract between a customer and a
            Freelancer. We do not supply or control the underlying service. We do not employ Freelancers. We do not act as a
            recruitment agency, labour broker, tax agent, or professional adviser. Verification checks on Freelancers assist
            trust and safety but are not a guarantee of quality, suitability, fitness, qualifications, or outcomes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">5. Independent contractors and tax</h2>
          <p className="leading-relaxed">
            Freelancers use the Platform as independent contractors. Nothing in these Terms creates an employment, agency,
            partnership, joint venture, or franchise relationship between Skillance and any Freelancer or customer. We do not
            withhold PAYE, SDL, UIF, or any other taxes on a Freelancer&apos;s behalf.
          </p>
          <p className="leading-relaxed">
            Freelancers are responsible for their own tax registration, returns, and compliance with the South African
            Revenue Service (SARS) and any other applicable authorities, for obtaining any required licences, and for their
            own insurance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">6. Account security</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for all activity under your account and for keeping credentials confidential.</li>
            <li>Notify us immediately at <a href="mailto:services@skillance.co.za" className="text-black underline">services@skillance.co.za</a> of any suspected unauthorised access.</li>
            <li>We may require additional verification (including identity verification and, where relevant, police clearance) for certain roles or categories.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">7. Bookings, pricing modes, and payments</h2>
          <p className="leading-relaxed">
            All prices on the Platform are displayed in South African Rand (ZAR) and, where applicable, include VAT. Payments
            are processed through our third-party payment provider (currently WalletDoc). Skillance does not store full card
            details.
          </p>
          <p className="leading-relaxed">Bookings follow one of two pricing modes, determined by the Freelancer&apos;s category configuration:</p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              <strong className="text-black">Hourly bookings.</strong> The total is derived from the Freelancer&apos;s hourly
              rate and the session duration. The customer pays the full amount up front; funds are held in escrow with our
              payment provider until the session is completed and the dispute window has closed.
            </li>
            <li>
              <strong className="text-black">Invoice bookings.</strong> The customer pays a{' '}
              <strong className="text-black">non-refundable connection fee of R50</strong> which unlocks in-app chat with the
              Freelancer. The Freelancer then issues an in-app invoice; the customer may accept or decline. If accepted and
              paid, the invoice total is held in escrow for the booking. If declined, the connection fee is not refunded.
            </li>
          </ul>
          <p className="leading-relaxed">
            Sessions are supported by a <strong className="text-black">session PIN</strong> model to evidence attendance and
            release escrow correctly. After session completion, a{' '}
            <strong className="text-black">24-hour dispute window</strong> applies before undisputed payouts are released to
            the Freelancer. Scheduled auto-completion and payout processing are handled by our backend.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">8. Platform commission and fees</h2>
          <p className="leading-relaxed">
            Skillance earns revenue as a <strong className="text-black">commission-based marketplace</strong>. Unless a
            different rate is agreed in writing with a specific Freelancer or category:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-black">Booking commission:</strong>{' '}
              <strong className="text-black">8–9% including VAT</strong> on the booking total for completed bookings, deducted
              before payout to the Freelancer.
            </li>
            <li>
              <strong className="text-black">Connection fee:</strong> a non-refundable R50 fee on the invoice path, as
              described in section 7.
            </li>
            <li>
              Payment processing fees charged by our payment provider may be absorbed by Skillance or allocated as disclosed
              in the Platform from time to time.
            </li>
          </ul>
          <p className="leading-relaxed">
            Fee amounts and rates are displayed in-app before checkout and may change on notice. Historical commission on a
            completed booking is finalised based on the rate applied at the time of completion.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">9. Cancellations, refunds, and Consumer Protection Act rights</h2>
          <p className="leading-relaxed">
            Cancellations, refunds, no-shows, disputed quality outcomes, and partial refunds are governed by our{' '}
            <Link to="/refund-policy" className="text-black underline underline-offset-4 hover:no-underline">Refund Policy</Link>
            , which forms part of these Terms.
          </p>
          <p className="leading-relaxed">
            Nothing in these Terms excludes or limits rights a customer may have under the Consumer Protection Act 68 of 2008
            (&quot;CPA&quot;), the Electronic Communications and Transactions Act 25 of 2002 (&quot;ECTA&quot;), or any other
            South African law that cannot lawfully be excluded or limited. Where a right cannot be limited, our Terms apply to
            the fullest extent permitted by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">10. Acceptable use and prohibited conduct</h2>
          <p className="leading-relaxed">You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the Platform unlawfully or for any purpose that is fraudulent, harmful, or abusive.</li>
            <li>Circumvent the Platform to avoid fees by, for example, sharing contact details to transact off-platform before a booking is lawfully completed.</li>
            <li>Upload, post, or share content that is defamatory, hateful, sexually explicit (including CSAM), violent, harassing, threatening, deceptive, misleading, or that infringes intellectual property, privacy, or other rights.</li>
            <li>Attempt to access, probe, or scan the Platform beyond your authorisation, or interfere with its security or availability.</li>
            <li>Use bots, scrapers, or automated tools to collect data, including about other users, without our prior written consent.</li>
            <li>Impersonate any person or misrepresent affiliation, qualifications, or identity.</li>
            <li>Offer or solicit services that are illegal in South Africa, require regulatory licences you do not hold, or that we have disallowed in our category rules.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">11. User-generated content, moderation, and reviews</h2>
          <p className="leading-relaxed">
            You retain ownership of content you submit (profiles, portfolios, messages, reviews, media, &quot;UGC&quot;). You
            grant Skillance a worldwide, non-exclusive, royalty-free, sub-licensable licence to host, store, reproduce,
            display, adapt, and distribute your UGC on and through the Platform to operate, promote, and improve the Platform
            and related services.
          </p>
          <p className="leading-relaxed">
            We use automated and human moderation to help detect and handle unsafe or prohibited content. We may remove,
            restrict, or demote content, limit features, or take account action where we believe content or behaviour breaches
            these Terms or our community rules. Users may report content via in-app reporting tools or by emailing us. We will
            respond to valid reports within a reasonable time.
          </p>
          <p className="leading-relaxed">
            Reviews must reflect a genuine experience, must not be defamatory, threatening, or otherwise unlawful, and may be
            edited for length, formatting, or privacy (for example, to redact personal data of third parties).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">12. Safety, verification, and off-platform interactions</h2>
          <p className="leading-relaxed">
            We take reasonable steps to verify Freelancer identity (South African ID or equivalent and profile-photo match)
            before a Freelancer may take bookings. Freelancers may optionally upload a police clearance certificate as an
            additional trust signal on their profile, and we reserve the right to require further verification for specific
            roles or categories. Skillance does not require trade certifications as a condition of registration &mdash;
            Customers evaluate Freelancers through public ratings and reviews from completed bookings. Verification is not a
            guarantee. Customers and Freelancers interact in person or remotely at their own risk. You are expected to use
            ordinary care, follow the safety guidance we publish in the Help Center and Trust &amp; Safety pages, and to
            report safety incidents promptly.
          </p>
          <p className="leading-relaxed">
            Do not meet in unsafe locations, share financial information beyond what is required to complete a Platform
            transaction, or take jobs outside the Platform to avoid platform protections.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">13. Intellectual property</h2>
          <p className="leading-relaxed">
            The Platform, including its software, designs, marks, logos, and content (excluding UGC), is owned by Skillance or
            our licensors and is protected by South African and international intellectual property laws. Subject to these
            Terms, you are granted a limited, revocable, non-exclusive, non-transferable licence to access and use the
            Platform for its intended purpose. No other rights are granted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">14. Mobile apps, app stores, and device terms</h2>
          <p className="leading-relaxed">
            If you download the Skillance mobile app from the Apple App Store or Google Play, your download and use is also
            subject to the applicable store&apos;s terms (Apple Media Services Terms; Google Play Terms of Service).
          </p>
          <p className="leading-relaxed">
            <strong className="text-black">Apple-specific (iOS):</strong> The licence to use the app on an Apple device is
            granted by Skillance, not by Apple. Apple is not responsible for the app or its content. Apple has no obligation
            to provide any support or maintenance. To the maximum extent permitted by law, Apple will have no warranty
            obligations and claims arising from failure to conform to any warranty will be the responsibility of Skillance.
            Apple is a third-party beneficiary of these Terms and may enforce them against you as a user of the iOS app.
          </p>
          <p className="leading-relaxed">
            <strong className="text-black">Google-specific (Android):</strong> You acknowledge that Google is not a party to
            these Terms and is not responsible for the app or its contents. Google Play&apos;s refund and device policies may
            apply to store-level purchases and subscriptions where applicable.
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            Skillance does not currently charge recurring subscriptions or offer in-app purchases beyond booking-related
            payments and the R50 connection fee, all of which are described in section 7.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">15. Third-party services</h2>
          <p className="leading-relaxed">
            The Platform integrates third-party services including, without limitation, payment processing, mapping
            (Mapbox), push and realtime messaging, analytics and tag management (Google services), and authentication
            providers. Your use of those services may be subject to their own terms and privacy policies. We are not
            responsible for third-party services or content except as required by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">16. Suspension, termination, and account deletion</h2>
          <p className="leading-relaxed">
            We may suspend, restrict, or terminate access to your account or the Platform, and remove content, where we
            reasonably believe there has been a breach of these Terms, fraud, abuse, a safety or legal risk, or where required
            by law. Where practical, we will provide notice and an opportunity to respond.
          </p>
          <p className="leading-relaxed">
            You can request deletion of your account at any time from within the app, via the website profile, or by emailing{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">services@skillance.co.za</a>.
            Some records (for example, transaction logs, compliance audit logs, tax records, dispute evidence) may be
            retained as required by law or for legitimate business purposes. See the Privacy Policy for retention details.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">17. Disclaimers</h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by applicable law, the Platform is provided &quot;as is&quot; and &quot;as
            available&quot;. We do not warrant that the Platform will be uninterrupted, secure, error-free, or that any
            particular Freelancer or customer interaction will produce a desired outcome. Nothing in this section excludes
            liability or rights that cannot lawfully be excluded, including under the CPA and ECTA.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">18. Limitation of liability</h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by law, and subject to rights that cannot lawfully be limited:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Skillance is not liable for indirect, consequential, incidental, special, or punitive damages.</li>
            <li>Skillance is not liable for the acts, omissions, negligence, or misconduct of Freelancers or customers, or for injury, loss, or damage arising out of a service provided or received by them.</li>
            <li>
              Our total aggregate liability in contract, delict, or otherwise, arising out of or in connection with the
              Platform or a specific booking, is limited to the greater of (a) the platform commission actually received by
              Skillance on the booking giving rise to the claim, or (b) R1,000.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">19. Indemnity</h2>
          <p className="leading-relaxed">
            You agree to indemnify and hold Skillance and its directors, employees, and contractors harmless from claims,
            damages, losses, and reasonable legal fees arising out of (i) your breach of these Terms, (ii) your UGC or
            conduct on the Platform, or (iii) your breach of any applicable law, in each case to the extent permitted by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">20. Dispute resolution and governing law</h2>
          <p className="leading-relaxed">
            We encourage users to try to resolve disputes in good faith directly, then via in-app support. For platform-level
            assistance, contact{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">services@skillance.co.za</a>.
            Disputes about completed or in-flight bookings follow the{' '}
            <Link to="/refund-policy" className="text-black underline underline-offset-4 hover:no-underline">Refund Policy</Link>{' '}
            and the in-app dispute flow (including the 24-hour post-session dispute window).
          </p>
          <p className="leading-relaxed">
            These Terms and any dispute relating to them are governed by the laws of the Republic of South Africa. Subject to
            rights under the CPA and ECTA, and to your rights to approach statutory bodies such as the National Consumer
            Commission or the Information Regulator, you and Skillance agree to submit to the non-exclusive jurisdiction of
            the Magistrate&apos;s and High Courts of South Africa having appropriate jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">21. General</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-black">Severability.</strong> If a provision is held unenforceable, the remaining provisions continue in effect.</li>
            <li><strong className="text-black">No waiver.</strong> Failure to enforce a provision is not a waiver.</li>
            <li><strong className="text-black">Assignment.</strong> You may not assign these Terms without our written consent; we may assign on notice.</li>
            <li><strong className="text-black">Entire agreement.</strong> These Terms, together with the Privacy, Cookie, and Refund Policies, are the entire agreement between you and Skillance on the subject matter.</li>
            <li><strong className="text-black">Electronic communications.</strong> You consent to receiving communications electronically (email, in-app, push) in line with ECTA.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-serif text-black mb-2">22. Contact</h2>
          <p className="leading-relaxed">
            RIMITSO MANAGEMENT SERVICES (PTY) LTD, operator of Skillance. Email{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">services@skillance.co.za</a>{' '}
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
            This page is published in good faith for transparency and compliance with applicable South African law. It is not
            a substitute for legal advice. If you need advice tailored to your circumstances, consult a qualified attorney.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default Terms;
