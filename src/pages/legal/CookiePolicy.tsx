import { Link } from 'react-router-dom';
import PageTemplate from '../../components/layout/PageTemplate';
import { CorporateLegalAddressInline } from '../../components/corporate/CorporateLegalAddress';
import { COOKIE_POLICY_VERSION } from '@/constants/cookieConsent';

const CookiePolicy = () => {
  return (
    <PageTemplate title="Cookie Policy" animateSections>
      <div className="space-y-10 text-neutral-600">
        <div className="space-y-3">
          <p className="text-xl leading-relaxed italic text-black/80">
            Last updated: 19 April 2026
          </p>
          <p className="text-sm leading-relaxed text-neutral-500">
            Policy version for consent records: <span className="font-mono text-neutral-700">{COOKIE_POLICY_VERSION}</span>
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">1. Purpose and who this applies to</h2>
          <p className="leading-relaxed">
            This Cookie Policy explains how Skillance (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses cookies and similar
            technologies on <span className="font-mono text-sm">skillance.co.za</span> and related web properties we operate
            (the &quot;Site&quot;). It should be read together with our{' '}
            <Link to="/privacy-policy" className="text-black underline underline-offset-4 hover:no-underline">
              Privacy Policy
            </Link>
            , which describes how we process personal information more broadly.
          </p>
          <p className="leading-relaxed">
            Where cookies or similar technologies involve personal information, we process that information in line with the
            Protection of Personal Information Act, 2013 (&quot;POPIA&quot;, Act 4 of 2013) and other applicable South African
            law. This policy is intended to meet POPIA&apos;s transparency expectations (including section 18-style notification
            where personal information is collected through the Site).
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            This page is for transparency and operational clarity. It does not constitute legal advice. If you need advice
            tailored to your situation, consult a qualified professional.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">2. Responsible party</h2>
          <p className="leading-relaxed">
            The operator responsible for this site is <strong className="text-black">RIMITSO MANAGEMENT SERVICES (PTY) LTD</strong>
            . Skillance is <strong className="text-black">owned by and part of</strong> Rimitso Management Services.
            Registered office: <CorporateLegalAddressInline className="text-black" />. For
            privacy and cookie-related questions, contact us at{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>
            . We will respond within a reasonable period, in line with POPIA.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">3. What we mean by cookies and similar technologies</h2>
          <p className="leading-relaxed">
            &quot;Cookies&quot; are small text files placed on your device when you visit a website. We also use closely
            related technologies that store or read information on your device, such as{' '}
            <strong className="text-black">local storage</strong> (for example, to remember your cookie choices on this
            device) and <strong className="text-black">pixels or tags</strong> loaded through our tag manager where you have
            granted consent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">4. How we group cookies and why we use them</h2>
          <p className="leading-relaxed">
            We group technologies into the categories below. This matches the choices presented in our cookie banner
            (&quot;Accept all&quot;, &quot;Reject non-essential&quot;, and &quot;Customize&quot;).
          </p>

          <div className="space-y-6 mt-6">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 dark:bg-neutral-900/40 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-black mb-2">4.1 Strictly necessary (always on)</h3>
              <p className="leading-relaxed mb-3">
                These technologies are needed for core Site functions such as security, load balancing, session continuity,
                fraud prevention, and remembering your cookie preference itself. They are used based on our legitimate
                interests in operating a secure, reliable service and, where applicable, to perform our contract with you
                when you use account features.
              </p>
              <p className="leading-relaxed text-sm text-neutral-500">
                Examples include first-party session or authentication-related storage, security-related cookies, and the
                local storage entry we use to store your consent state (key aligned with our application configuration).
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-black mb-2">4.2 Analytics (optional)</h3>
              <p className="leading-relaxed mb-3">
                If you opt in, we use analytics technologies to understand aggregate traffic, performance, and how the Site is
                used (for example, pages viewed and approximate usage patterns). These may involve processing of identifiers
                or usage data that can constitute personal information under POPIA.
              </p>
              <p className="leading-relaxed text-sm text-neutral-500">
                We use <strong className="text-black">Google Tag Manager</strong> and related Google measurement tools. Tags
                are configured to respect <strong className="text-black">Google Consent Mode</strong> defaults and updates
                based on your choice. Analytics storage remains denied until you grant consent for analytics.
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-black mb-2">4.3 Marketing / advertising (optional)</h3>
              <p className="leading-relaxed mb-3">
                If you opt in, marketing technologies may be used for advertising, remarketing, campaign measurement, or
                similar purposes. These may involve processing personal information and may combine data across sites or
                services according to the relevant third party&apos;s policies.
              </p>
              <p className="leading-relaxed text-sm text-neutral-500">
                Ad-related storage (for example, ad storage and ad personalization signals in Consent Mode) remains denied
                until you grant consent for marketing.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">5. Consent, withdrawal, and changing your mind</h2>
          <p className="leading-relaxed">
            Under POPIA, consent must be voluntary, specific, and informed where we rely on consent for non-essential
            processing. When you first visit (or if no valid choice is stored), we present a banner so you can accept all,
            reject non-essential, or customize analytics and marketing separately.
          </p>
          <p className="leading-relaxed">
            You may <strong className="text-black">withdraw or change consent</strong> at any time where processing is based
            on consent. Practical ways to do this include: clearing Site data for Skillance in your browser (which removes
            the locally stored consent record and will typically cause the banner to appear again on a future visit), or
            contacting us at{' '}
            <a href="mailto:services@skillance.co.za" className="text-black underline underline-offset-4 hover:no-underline">
              services@skillance.co.za
            </a>{' '}
            for assistance. Withdrawing consent does not affect the lawfulness of processing that occurred before withdrawal.
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            You can also use your browser&apos;s cookie controls and, where available, industry opt-out tools. Third-party
            tools may still read their own cookies subject to their policies and your settings.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">6. Record of your choice (server-side)</h2>
          <p className="leading-relaxed">
            When you save a choice, we may create a <strong className="text-black">security and compliance record</strong>{' '}
            in our systems (for example, an audit log entry) containing the policy version, decision type, analytics and
            marketing toggles, a timestamp, and technical metadata such as IP address and browser user-agent string. If you
            are logged in, the record may be associated with your user account so we can demonstrate what was selected where
            required.
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            This processing supports accountability, dispute handling, and regulatory expectations. It is described further
            in our Privacy Policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">7. Retention</h2>
          <p className="leading-relaxed">
            Strictly necessary cookies and local storage used to operate the Site are kept only as long as needed for their
            purpose (for example, for the life of a session or until you clear them). Analytics and marketing data held by
            third parties is retained according to their retention settings and your choices.
          </p>
          <p className="leading-relaxed">
            Our own compliance records are retained for a limited period consistent with our Privacy Policy and operational
            needs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">8. Cross-border processing</h2>
          <p className="leading-relaxed">
            Some optional technologies (for example, Google services) may involve processing in countries outside South
            Africa. Where personal information is transferred across borders, we take POPIA into account (including Chapter 9
            requirements where applicable) and rely on appropriate mechanisms offered by our providers (such as
            contractual safeguards and vendor compliance programmes), in addition to your consent where consent is the basis
            for optional tags.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">9. Your rights under POPIA</h2>
          <p className="leading-relaxed">
            Depending on the circumstances, you may have rights to access, correct, delete, or restrict certain processing,
            to object on legitimate grounds, and to withdraw consent where processing is consent-based. You may also lodge a
            complaint with the{' '}
            <a
              href="https://inforegulator.org.za/"
              className="text-black underline underline-offset-4 hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Information Regulator (South Africa)
            </a>
            .
          </p>
          <p className="leading-relaxed text-sm text-neutral-500">
            For details and how to exercise rights, see our Privacy Policy and contact us using the details in section 2.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">10. Children</h2>
          <p className="leading-relaxed">
            Our services are not directed at children in a way that requires special cookie processing beyond our general
            approach. If you believe a child has interacted with optional tracking inappropriately, contact us and we will
            take reasonable steps to assist.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-serif text-black mb-2">11. Updates</h2>
          <p className="leading-relaxed">
            We may update this Cookie Policy from time to time to reflect changes in law, technology, or our practices. When
            we do, we will revise the &quot;Last updated&quot; date and may bump the policy version used in consent records.
            Material changes may also be communicated through the Site or other reasonable means where appropriate.
          </p>
        </section>
      </div>
    </PageTemplate>
  );
};

export default CookiePolicy;
