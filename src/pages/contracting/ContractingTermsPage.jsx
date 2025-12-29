import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'

const ContractingTermsPage = () => {
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
                By accessing or using the Skillance website and contracting services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                2. Description of Services
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Skillance provides software development and contracting services, including but not limited to mobile application development, web development, custom software solutions, and UI/UX design services.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                3. Project Agreements
              </h2>
              <h3 className="text-xl font-semibold mb-3">3.1 Project Scope</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                All projects will be governed by a separate project agreement or statement of work that outlines the specific scope, deliverables, timeline, and pricing. These Terms of Service apply to all projects unless otherwise specified in the project agreement.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Changes to Scope</h3>
              <p className="text-text-secondary leading-relaxed">
                Any changes to the project scope must be agreed upon in writing and may result in adjustments to timeline and pricing.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                4. Payment Terms
              </h2>
              <h3 className="text-xl font-semibold mb-3">4.1 Payment Schedule</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Payment terms will be specified in the project agreement. Typically, payments are made in installments based on project milestones. All invoices are due within the timeframe specified in the agreement.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Late Payments</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Late payments may incur interest charges and may result in suspension of work until payment is received. We reserve the right to withhold deliverables until payment is complete.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Refunds</h3>
              <p className="text-text-secondary leading-relaxed">
                Refund policies are determined on a project-by-project basis and will be outlined in the project agreement. Generally, payments for completed work are non-refundable.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                5. Intellectual Property
              </h2>
              <h3 className="text-xl font-semibold mb-3">5.1 Client Ownership</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Upon full payment, the client will own the deliverables specified in the project agreement. We retain the right to use the work in our portfolio and for marketing purposes unless otherwise agreed.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Pre-existing Materials</h3>
              <p className="text-text-secondary leading-relaxed">
                We retain ownership of any pre-existing materials, tools, frameworks, or code libraries used in the project. The client receives a license to use these materials as part of the deliverables.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                6. Client Responsibilities
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                The client agrees to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>Provide accurate and complete information necessary for project completion</li>
                <li>Respond to requests for feedback and approvals in a timely manner</li>
                <li>Make payments according to the agreed schedule</li>
                <li>Provide access to necessary systems, accounts, or resources</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                7. Warranties and Disclaimers
              </h2>
              <h3 className="text-xl font-semibold mb-3">7.1 Service Warranty</h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                We warrant that our services will be performed in a professional and workmanlike manner. We will correct any defects in our work that are reported within the warranty period specified in the project agreement.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">7.2 Disclaimer</h3>
              <p className="text-text-secondary leading-relaxed">
                Except as expressly stated in the project agreement, we make no warranties, express or implied, regarding the services or deliverables. We are not responsible for third-party software, services, or platforms used in connection with our deliverables.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                8. Limitation of Liability
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Our liability for any claims arising from our services is limited to the total amount paid by the client for the specific project. We are not liable for indirect, incidental, special, or consequential damages, including lost profits or data.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                9. Confidentiality
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Both parties agree to maintain the confidentiality of proprietary information shared during the course of the project. This obligation survives termination of the project agreement.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                10. Termination
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Either party may terminate a project agreement with written notice. Upon termination:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                <li>The client will pay for all work completed up to the termination date</li>
                <li>We will deliver all completed work to the client</li>
                <li>Confidentiality obligations will continue</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                11. Indemnification
              </h2>
              <p className="text-text-secondary leading-relaxed">
                The client agrees to indemnify and hold Skillance harmless from any claims, damages, or expenses arising from the client's use of deliverables, violation of these terms, or infringement of third-party rights.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-text-secondary leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                13. Governing Law
              </h2>
              <p className="text-text-secondary leading-relaxed">
                These Terms of Service are governed by the laws of South Africa. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts of South Africa.
              </p>
            </section>

            <section>
              <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-semibold mb-4">
                14. Contact Information
              </h2>
              <p className="text-text-secondary leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-text-secondary leading-relaxed mt-4">
                <strong>Email:</strong> legal@skillance.com<br />
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

export default ContractingTermsPage

