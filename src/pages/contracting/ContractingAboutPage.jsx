import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { VALUES } from '@/utils/contractingConstants'
import { Lightbulb, Award, Users, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const iconMap = {
  Lightbulb,
  Award,
  Users,
  Shield,
}

const ContractingAboutPage = () => {
  return (
    <>
      <PageHeader
        title="About Skillance"
        subtitle="Building the future, one line of code at a time"
        breadcrumb={['Home', 'About']}
      />

      {/* Company Story */}
      <Section>
        <AnimatedSection animation="fadeInUp">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl font-bold mb-6">
              Our Story
            </h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              Founded with a passion for technology and innovation, Skillance has grown from a small startup
              to a trusted partner for businesses seeking digital transformation.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              We believe that great software is built by great teams. Our diverse group of developers, designers,
              and strategists brings together years of experience and a shared commitment to excellence.
            </p>
          </div>
        </AnimatedSection>
      </Section>

      {/* Mission & Vision */}
      <Section background="grey">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <AnimatedSection animation="slideInLeft">
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 bg-gradient-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-4">
                    <Lightbulb size={24} className="text-white" />
                  </div>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>Our Mission</CardTitle>
                  <CardDescription className="text-base pt-4">
                    To empower businesses with innovative software solutions that drive growth,
                    enhance efficiency, and create lasting value for our clients and their customers.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </AnimatedSection>

          <AnimatedSection animation="slideInRight">
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 bg-gradient-card">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-4">
                    <Award size={24} className="text-white" />
                  </div>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>Our Vision</CardTitle>
                  <CardDescription className="text-base pt-4">
                    To be the leading software development partner recognized for delivering exceptional
                    quality, fostering innovation, and building long-term relationships based on trust.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </AnimatedSection>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl font-bold mb-4">
              Our Values
            </h2>
            <p className="text-lg text-text-secondary">
              The principles that guide everything we do
            </p>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((value, index) => {
            const Icon = iconMap[value.icon]
            return (
              <AnimatedSection key={value.id} animation="fadeInUp">
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card className="h-full text-center hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 bg-gradient-card">
                    <CardHeader>
                      <motion.div 
                        className="mx-auto w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-gradient-accent shadow-accent"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon size={28} className="text-white" />
                      </motion.div>
                      <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-xl">
                        {value.title}
                      </CardTitle>
                      <CardDescription className="text-sm pt-2">
                        {value.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              </AnimatedSection>
            )
          })}
        </div>
      </Section>
    </>
  )
}

export default ContractingAboutPage

