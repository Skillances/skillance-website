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
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                1. Introduction
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold mb-3">2.1 Personal Information</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Name, email address, phone number</li>
                <li>Profile information and photos</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Location data when you enable location services</li>
                <li>Service preferences and booking history</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                We automatically collect certain information when you use our app:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Device information (model, operating system, unique identifiers)</li>
                <li>Usage data and app interactions</li>
                <li>IP address and network information</li>
                <li>Cookies and similar tracking technologies</li>
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
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Verify freelancer identities and credentials</li>
                <li>Match customers with appropriate freelancers</li>
                <li>Send you updates, security alerts, and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li><strong>With Service Providers:</strong> We share information with third-party service providers who perform services on our behalf (payment processing, data storage, analytics)</li>
                <li><strong>Between Users:</strong> Basic profile information is shared between customers and freelancers to facilitate bookings</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Data Security
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                6. Your Rights and Choices
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Control location sharing through device settings</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                7. Children's Privacy
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                9. Contact Us
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Email:</strong> privacy@skillance.app<br />
                <strong>Address:</strong> Johannesburg, South Africa
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  )
}

export default AppPrivacyPage

