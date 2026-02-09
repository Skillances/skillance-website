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
          <div className="text-center max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8">
              Who We Are
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-text-secondary leading-relaxed mb-4 sm:mb-5 md:mb-6">
              Skillance is a software development company dedicated to creating exceptional digital experiences.
              We combine technical expertise with creative problem-solving to deliver solutions that drive business growth.
            </p>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-text-secondary leading-relaxed">
              Our team of experienced developers, designers, and strategists work collaboratively to transform
              your vision into reality, ensuring every project exceeds expectations.
            </p>
          </div>
        </AnimatedSection>
      </Section>

      {/* Services Preview */}
      <Section>
        <div className="text-center max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <AnimatedSection animation="fadeInUp">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              Our Services
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-text-secondary">
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
