import HeroSection from '@/components/home/HeroSection'
import ServicesPreview from '@/components/home/ServicesPreview'
import CTASection from '@/components/home/CTASection'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

const ContractingHomePage = () => {
  return (
    <>
      <HeroSection />

      {/* Company Overview */}
      <Section background="grey">
        <div className="relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
          
          <div className="relative z-10">
            <AnimatedSection animation="fadeInUp">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-accent mb-6"
                >
                  <Target size={32} className="text-white" />
                </motion.div>
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
          </div>
        </div>
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

export default ContractingHomePage

