import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'

const ContractingPrivacyPage = () => {
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
                Skillance ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our contracting services.
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
                <li>Company name and business information</li>
                <li>Project requirements and specifications</li>
                <li>Communication records and correspondence</li>
                <li>Payment and billing information</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                We automatically collect certain information when you visit our website:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Browser type and version</li>
                <li>IP address and location data</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
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
                <li>Provide, maintain, and improve our contracting services</li>
                <li>Respond to your inquiries and project requests</li>
                <li>Process payments and send invoices</li>
                <li>Communicate about projects and services</li>
                <li>Send you updates, newsletters, and marketing materials (with your consent)</li>
                <li>Analyze website usage and improve user experience</li>
                <li>Comply with legal obligations</li>
                <li>Protect our rights and prevent fraud</li>
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
                <li><strong>With Service Providers:</strong> We share information with third-party service providers who perform services on our behalf (hosting, payment processing, email services)</li>
                <li><strong>Business Partners:</strong> We may share information with trusted partners who assist in delivering our services</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Data Security
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
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
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to processing of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent where processing is based on consent</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                8. Third-Party Links
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                9. Data Retention
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                11. Contact Us
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Email:</strong> privacy@skillance.com<br />
                <strong>Phone:</strong> +27 (0)11 234 5678<br />
                <strong>Address:</strong> Johannesburg, South Africa
              </p>
            </section>
          </div>
        </AnimatedSection>
      </div>
    </Section>
  )
}

export default ContractingPrivacyPage

