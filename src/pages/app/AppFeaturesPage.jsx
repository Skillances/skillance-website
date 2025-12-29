import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import FeatureComparison from '@/components/app/FeatureComparison'
import HowItWorksSideBySide from '@/components/app/HowItWorksSideBySide'
import DownloadCTA from '@/components/app/DownloadCTA'
import TrustSection from '@/components/app/TrustSection'
import ScrollProgress from '@/components/app/ScrollProgress'
import FloatingCTA from '@/components/app/FloatingCTA'
import AnimatedStats from '@/components/app/AnimatedStats'

const AppFeaturesPage = () => {
  return (
    <>
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Floating Download Button */}
      <FloatingCTA />

      <PageHeader
        title="Features"
        subtitle="Powerful tools for customers and freelancers"
        breadcrumb={['Home', 'Features']}
      />

      {/* Hero Feature Statement */}
      <Section>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Stop Searching. Start Finding.
            </h2>
            <p className="text-xl text-text-secondary">
              No more asking around or relying on word of mouth. Find verified professionals instantly and get things done.
            </p>
          </AnimatedSection>
        </div>

        <FeatureComparison />
      </Section>

      {/* Animated Statistics */}
      <AnimatedStats />

      {/* How It Works - Side by Side */}
      <Section background="grey">
        <HowItWorksSideBySide />
      </Section>

      {/* Trust & Security */}
      <Section background="grey">
        <TrustSection />
      </Section>

      {/* Download CTA */}
      <Section>
        <DownloadCTA />
      </Section>
    </>
  )
}

export default AppFeaturesPage

