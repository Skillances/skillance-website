import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'

const AppPrivacyPage = () => {
  return (
    <Section>
      <div className="container mx-auto container-padding max-w-4xl">
        <AnimatedSection animation="fadeInUp">
          <h1
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Privacy Policy
          </h1>
          <p className="text-text-secondary mb-8">
            Last updated: 27 February 2025
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                1. Introduction
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance is a marketplace connecting customers with freelancers for services such as tutoring and home services. This Privacy Policy explains how we collect, use, and protect your personal information in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA) and other applicable South African law.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                2. Information We Collect
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We collect information you provide directly:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li><strong>Account:</strong> name, email, phone number, profile photo</li>
                <li><strong>Profile (freelancers):</strong> bio, skills, rates, certifications, portfolio photos, age (optional), gender (optional), service locations and addresses</li>
                <li><strong>Identity verification (freelancers):</strong> South African ID or passport number, photos of ID document (front and back), a selfie, and optional proof of address for verification purposes</li>
                <li><strong>Payment:</strong> card and bank details are processed by our payment partner WalletDoc; we do not store full card numbers</li>
                <li><strong>Booking history:</strong> dates, times, addresses, notes, and service details</li>
                <li><strong>Messaging:</strong> chat messages (text, images, voice) exchanged between customers and freelancers</li>
                <li><strong>Reviews:</strong> ratings and comments you leave after completed bookings</li>
                <li><strong>Location:</strong> city and approximate coordinates for service area display; precise location only when you enable proximity search (opt-in)</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Provide and operate the Skillance platform</li>
                <li>Process bookings and payments</li>
                <li>Facilitate messaging between customers and freelancers</li>
                <li>Verify freelancer identity and display service areas on maps</li>
                <li>Send technical notices, support messages, and booking updates</li>
                <li>Improve our services and analyse usage (via analytics)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                4. Third-Party Services
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We use trusted third parties who process data on our behalf:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li><strong>Firebase (Google):</strong> authentication, analytics, and performance monitoring</li>
                <li><strong>Mapbox:</strong> maps and location display (approximate locations shown for freelancer privacy)</li>
                <li><strong>Soketi/Pusher:</strong> real-time chat messaging</li>
                <li><strong>Payment processor (WalletDoc):</strong> payment processing</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                These providers have their own privacy policies. We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Information Sharing
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We do not sell your personal information. We may share information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>With freelancers/customers as needed to fulfil bookings and messages</li>
                <li>With service providers who assist us (under strict data processing agreements)</li>
                <li>To comply with legal obligations or lawful requests</li>
                <li>To protect our rights, safety, or the safety of users</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                6. Data Security and Retention
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We implement appropriate technical and organisational measures to protect your personal information. No internet transmission is 100% secure. We retain your data for as long as your account is active and as needed to comply with legal obligations (e.g. tax, disputes).
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                7. Data Breach Notification
              </h2>
              <p className="text-text-secondary leading-relaxed">
                In the event of a data breach that materially affects your personal information, we will notify affected users and the Information Regulator (South Africa) in accordance with POPIA and applicable law.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                8. Your Rights (POPIA)
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Under POPIA and our policies, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your information (subject to legal retention requirements)</li>
                <li>Object to processing or withdraw consent where applicable</li>
                <li>Lodge a complaint with the Information Regulator (South Africa)</li>
              </ul>
              <p className="text-text-secondary leading-relaxed mt-4">
                To exercise these rights, contact us at the email below.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                9. Contact Us
              </h2>
              <p className="text-text-secondary leading-relaxed">
                For questions about this Privacy Policy or to exercise your rights, contact us at:
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

export default AppPrivacyPage
