import HeroSection from '@/components/home/HeroSection'
import ServicesPreview from '@/components/home/ServicesPreview'
import CTASection from '@/components/home/CTASection'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'

const HomePage = () => {
  return (
    <>
      <HeroSection />

      {/* Company Overview */}
      <Section background="grey">
        <AnimatedSection animation="fadeInUp">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl font-bold mb-6">
              Who We Are
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              Skillance is a software development company dedicated to creating exceptional digital experiences.
              We combine technical expertise with creative problem-solving to deliver solutions that drive business growth.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              Our team of experienced developers, designers, and strategists work collaboratively to transform
              your vision into reality, ensuring every project exceeds expectations.
            </p>
          </div>
        </AnimatedSection>
      </Section>

      {/* Services Preview */}
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl font-bold mb-4">
              Our Services
            </h2>
            <p className="text-lg text-text-secondary">
              We offer comprehensive development services tailored to your needs
            </p>
          </AnimatedSection>
        </div>
        <ServicesPreview />
      </Section>

      {/* CTA Section */}
      <Section background="grey">
        <CTASection />
      </Section>
    </>
  )
}

export default HomePage
