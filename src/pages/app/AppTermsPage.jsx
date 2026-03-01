import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'

const AppTermsPage = () => {
  return (
    <Section>
      <div className="container mx-auto container-padding max-w-4xl">
        <AnimatedSection animation="fadeInUp">
          <h1
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Terms of Service
          </h1>
          <p className="text-text-secondary mb-8">
            Last updated: 27 February 2025
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance is a marketplace connecting customers with skilled freelancers for services such as tutoring, home services, and more. By accessing and using the Skillance mobile app or website, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Skillance operates a two-sided platform where:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Customers can browse, search, book, and pay for services from freelancers</li>
                <li>Freelancers can create profiles, set availability, accept bookings, and receive payments</li>
                <li>Users can communicate via in-app messaging and share reviews after completed bookings</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                3. Account and Use Requirements
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Use the service only for lawful purposes</li>
                <li>Provide accurate and complete information when registering</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not interfere with or disrupt the service or other users</li>
                <li>Not share personal contact details in messages to bypass the platform before a booking is confirmed</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                4. Booking and Payments
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                When you book a service:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Payment is processed securely through our payment partner WalletDoc</li>
                <li>Skillance may deduct a service fee or commission on transactions; the applicable rate will be displayed at the time of booking</li>
                <li>Service fees may change with reasonable notice; continued use after changes constitutes acceptance</li>
                <li>Cancellation and refund policies apply as specified in our Refund Policy</li>
                <li>Prices are set by freelancers and may vary; all amounts are in South African Rand (ZAR) unless otherwise stated</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Freelancer Responsibilities
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Freelancers agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Provide accurate profile information (bio, skills, rates, availability)</li>
                <li>Deliver services as described and at the agreed rate</li>
                <li>Maintain professional standards and respond promptly to bookings</li>
                <li>Comply with all applicable South African laws</li>
                <li>Complete identity verification when required</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                6. Independent Contractors
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Freelancers are independent contractors and are not employees, agents, or representatives of Skillance. Skillance does not control how services are delivered, sets only marketplace rules, and is not responsible for employment-related obligations such as PAYE, UIF, or tax withholding. Freelancers are responsible for their own tax and legal compliance.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                7. User-Generated Content
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                When you post reviews, send messages, or upload profile photos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>You grant Skillance a licence to use such content to operate the platform</li>
                <li>Reviews must be honest and related to the service received</li>
                <li>You may not post defamatory, offensive, or illegal content</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                8. Dispute Resolution
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                If a dispute arises between you and another user:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>We encourage you to resolve it directly first</li>
                <li>If unresolved, contact us at services@skillance.co.za for an internal review and mediation</li>
                <li>We may facilitate a resolution, but we are not obliged to resolve disputes and our decisions are final</li>
                <li>Where appropriate, disputes may be referred to arbitration under the laws of South Africa before resorting to courts</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                9. Account Suspension and Termination
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance reserves the right to suspend or terminate accounts for breach of these terms, fraud, abuse, misconduct, or any conduct that harms the platform or its users. We may also remove freelancer profiles, withhold payouts pending investigation, and take such other action as we deem necessary to protect the platform. You may appeal a suspension or termination by contacting us.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                10. Limitation of Liability
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Skillance is a platform facilitating transactions between customers and freelancers. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Disputes between users and freelancers (we encourage resolution through our support process)</li>
                <li>Service quality, outcomes, or freelancer conduct outside the platform</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                11. Governing Law
              </h2>
              <p className="text-text-secondary leading-relaxed">
                These terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of the South African courts.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                12. Modifications
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                13. Contact
              </h2>
              <p className="text-text-secondary leading-relaxed">
                For questions about these terms, contact us at:
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Email:</strong> services@skillance.co.za<br />
                <strong>Website:</strong> https://skillance.co.za
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  )
}

export default AppTermsPage
