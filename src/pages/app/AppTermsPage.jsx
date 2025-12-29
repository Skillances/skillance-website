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
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                By accessing or using the Skillance mobile application and services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                2. Description of Service
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance is a mobile marketplace platform that connects customers seeking services with verified freelancers. We facilitate the connection between users but are not a party to any service agreement between customers and freelancers.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                3. User Accounts
              </h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Account Creation</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                To use our services, you must create an account and provide accurate, complete information. You are responsible for maintaining the security of your account credentials.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Freelancer Verification</h3>
              <p className="text-text-secondary leading-relaxed">
                Freelancers must complete identity verification before accepting bookings. We reserve the right to verify credentials and may suspend or terminate accounts that provide false information.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                4. User Conduct
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful code or malware</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the service</li>
                <li>Collect user information without consent</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Bookings and Payments
              </h2>
              <h3 className="text-xl font-semibold mb-3">5.1 Booking Process</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Customers can browse and book services through the app. Bookings are subject to freelancer availability and acceptance. We facilitate the booking but are not responsible for the quality of services provided.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Payments</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                All payments are processed securely through third-party payment processors. We may charge service fees as disclosed at the time of booking. Refunds are subject to our cancellation policy.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.3 Cancellations</h3>
              <p className="text-text-secondary leading-relaxed">
                Cancellation policies vary by service type and are disclosed at booking. Customers and freelancers must comply with agreed cancellation terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                6. Reviews and Ratings
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Users may leave reviews and ratings after service completion. Reviews must be honest, accurate, and not contain defamatory, offensive, or inappropriate content. We reserve the right to remove reviews that violate our guidelines.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-text-secondary leading-relaxed">
                The Skillance app, including its design, features, and content, is protected by intellectual property laws. You may not copy, modify, or distribute any part of the service without our written permission.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance acts as a platform connecting users. We are not responsible for the quality, safety, or legality of services provided by freelancers. Users interact at their own risk. We are not liable for any damages arising from use of the service.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                9. Indemnification
              </h2>
              <p className="text-text-secondary leading-relaxed">
                You agree to indemnify and hold Skillance harmless from any claims, damages, losses, or expenses arising from your use of the service, violation of these terms, or infringement of any rights of another.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                10. Termination
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                11. Changes to Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                12. Governing Law
              </h2>
              <p className="text-text-secondary leading-relaxed">
                These Terms of Service are governed by the laws of South Africa. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                13. Contact Information
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Email:</strong> legal@skillance.app<br />
                <strong>Address:</strong> Johannesburg, South Africa
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  )
}

export default AppTermsPage

