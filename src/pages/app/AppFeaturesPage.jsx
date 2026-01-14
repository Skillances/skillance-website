import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import DownloadCTA from '@/components/app/DownloadCTA'
import FloatingCTA from '@/components/app/FloatingCTA'
import ScrollStack, { ScrollStackItem } from '@/components/app/ScrollStack'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'

const AppFeaturesPage = () => {
  return (
    <>
      {/* Floating Download Button */}
      <FloatingCTA />

      <PageHeader
        title="Features"
        subtitle="Everything you need in one app"
        breadcrumb={['Home', 'Features']}
      />

      {/* Main Value Proposition */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }} 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              >
                Stop Searching.<br />Start Finding.
              </h2>
              <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto">
                No more asking around. Find verified professionals instantly and get things done.
              </p>
            </div>
          </AnimatedSection>

          {/* Simple Feature Grid */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-16">
            <AnimatedSection animation="fadeInUp">
              <div className="space-y-6">
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-2xl md:text-3xl font-bold mb-4"
                >
                  For Customers
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-3 font-bold">•</span>
                    <span>Find verified freelancers instantly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-3 font-bold">•</span>
                    <span>Browse by category or search nearby</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-3 font-bold">•</span>
                    <span>Message before booking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-3 font-bold">•</span>
                    <span>Secure in-app payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-teal-600 mr-3 font-bold">•</span>
                    <span>Track jobs in real-time</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeInUp">
              <div className="space-y-6">
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-2xl md:text-3xl font-bold mb-4"
                >
                  For Freelancers
                </h3>
                <ul className="space-y-4 text-lg">
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-3 font-bold">•</span>
                    <span>Get verified and start earning</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-3 font-bold">•</span>
                    <span>Manage all jobs in one place</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-3 font-bold">•</span>
                    <span>Built-in chat with customers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-3 font-bold">•</span>
                    <span>Automatic payout calculations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-cyan-600 mr-3 font-bold">•</span>
                    <span>Track earnings and growth</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>
          </div>

          {/* Scroll Stack Comparison */}
          <div className="mt-16">
            <AnimatedSection animation="fadeInUp">
              <div className="text-center mb-12">
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  Why Skillance?
                </h3>
              </div>
            </AnimatedSection>
            
            <ScrollStack useWindowScroll={true}>
              <ScrollStackItem>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(20, 184, 166, 0.05)',
                    border: '2px solid rgba(20, 184, 166, 0.2)'
                  }}
                  className="h-full rounded-2xl p-8 md:p-12 flex flex-col"
                >
                  <h3 
                    style={{ 
                      fontFamily: 'var(--font-family-poppins)',
                      color: 'var(--color-section-primary)'
                    }}
                    className="text-2xl md:text-3xl font-bold mb-3"
                  >
                    ID Verified
                  </h3>
                  <p className="text-text-secondary text-lg mb-6">
                    All freelancers are verified
                  </p>
                  <ul className="space-y-3 flex-1">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Government ID verification required</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Background checks for safety</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Verified profiles only</span>
                    </li>
                  </ul>
                </div>
              </ScrollStackItem>
              
              <ScrollStackItem>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(8, 145, 178, 0.05)',
                    border: '2px solid rgba(8, 145, 178, 0.2)'
                  }}
                  className="h-full rounded-2xl p-8 md:p-12 flex flex-col"
                >
                  <h3 
                    style={{ 
                      fontFamily: 'var(--font-family-poppins)',
                      color: 'var(--color-section-secondary)'
                    }}
                    className="text-2xl md:text-3xl font-bold mb-3"
                  >
                    Secure Payments
                  </h3>
                  <p className="text-text-secondary text-lg mb-6">
                    Safe and protected transactions
                  </p>
                  <ul className="space-y-3 flex-1">
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">In-app payment processing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Secure escrow system</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-cyan-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Protected transactions</span>
                    </li>
                  </ul>
                </div>
              </ScrollStackItem>
              
              <ScrollStackItem>
                <div 
                  style={{ 
                    backgroundColor: 'rgba(20, 184, 166, 0.08)',
                    border: '2px solid rgba(20, 184, 166, 0.25)'
                  }}
                  className="h-full rounded-2xl p-8 md:p-12 flex flex-col"
                >
                  <h3 
                    style={{ 
                      fontFamily: 'var(--font-family-poppins)',
                      color: 'var(--color-section-primary)'
                    }}
                    className="text-2xl md:text-3xl font-bold mb-3"
                  >
                    Verified Reviews
                  </h3>
                  <p className="text-text-secondary text-lg mb-6">
                    Real feedback from real users
                  </p>
                  <ul className="space-y-3 flex-1">
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Only verified users can review</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Transparent rating system</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-teal-600 font-bold mt-1">•</span>
                      <span className="text-text-secondary">Helpful for decision making</span>
                    </li>
                  </ul>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </Section>

      {/* See It In Action */}
      <Section background="grey">
        <div className="text-center max-w-2xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              See It In Action
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              Watch videos and explore interactive demos
            </p>
            <Button 
              size="lg" 
              asChild
              style={{ backgroundColor: 'var(--color-section-primary)' }}
              className="group"
            >
              <Link to="/videos">
                <Play className="mr-2" size={20} />
                Watch Videos
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </Section>

      {/* Download CTA */}
      <Section>
        <DownloadCTA />
      </Section>
    </>
  )
}

export default AppFeaturesPage

