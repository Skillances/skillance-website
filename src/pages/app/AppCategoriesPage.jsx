import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import CategoryGrid from '@/components/app/CategoryGrid'
import DownloadCTA from '@/components/app/DownloadCTA'
import FloatingCTA from '@/components/app/FloatingCTA'
import AnimatedStats from '@/components/app/AnimatedStats'
import TrustSection from '@/components/app/TrustSection'
import { SERVICE_CATEGORIES } from '@/utils/appConstants'

const AppCategoriesPage = () => {
  return (
    <>
      {/* Floating Download Button */}
      <FloatingCTA />

      <PageHeader
        title="Service Categories"
        subtitle="Find the perfect freelancer for any task"
        breadcrumb={['Home', 'Categories']}
      />

      {/* Animated Statistics */}
      <AnimatedStats />

      {/* All Categories */}
      <Section>
        <div className="max-w-4xl mx-auto text-center mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              All Service Categories
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Browse our wide range of service categories. Whether you need help with home 
              repairs, pet care, tutoring, or anything in between, Skillance connects you 
              with verified professionals.
            </p>
          </AnimatedSection>
        </div>

        <CategoryGrid />
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

export default AppCategoriesPage

