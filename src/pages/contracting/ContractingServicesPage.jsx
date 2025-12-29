import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Smartphone, Globe, Code } from 'lucide-react'
import { SERVICES, PROCESS_STEPS } from '@/utils/contractingConstants'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const iconMap = {
  Smartphone,
  Globe,
  Code,
}

const ContractingServicesPage = () => {
  return (
    <>
      <PageHeader
        title="Our Services"
        subtitle="Comprehensive development solutions for modern businesses"
        breadcrumb={['Home', 'Services']}
      />

      {/* Services Detail */}
      <Section>
        <div className="space-y-16">
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon]
            const isEven = index % 2 === 0

            return (
              <AnimatedSection key={service.id} animation={isEven ? 'slideInLeft' : 'slideInRight'}>
                <Card className="overflow-hidden hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300">
                  <div className="grid md:grid-cols-2 gap-8 p-8">
                    <div>
                      <motion.div 
                        className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-gradient-accent shadow-accent"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Icon size={32} className="text-white" />
                      </motion.div>
                      <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl mb-4">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-base mb-6">
                        {service.description}
                      </CardDescription>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          asChild 
                          className="bg-gradient-primary text-white border-0 shadow-professional hover:shadow-accent-lg transition-all"
                        >
                          <Link to="/contact">Get a Quote</Link>
                        </Button>
                      </motion.div>
                    </div>

                    <div className="bg-gradient-card rounded-lg p-6">
                      <h4 style={{ fontFamily: 'var(--font-family-poppins)' }} className="font-semibold text-lg mb-4">
                        Key Features
                      </h4>
                      <ul className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="w-5 h-5 rounded-full bg-gradient-accent flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                              <Check size={14} className="text-white" />
                            </div>
                            <span className="text-text-secondary">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>
      </Section>

      {/* Process Section */}
      <Section background="grey">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl font-bold mb-4">
              Our Development Process
            </h2>
            <p className="text-lg text-text-secondary">
              A proven methodology that ensures quality and timely delivery
            </p>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-accent-teal)] to-transparent opacity-20" style={{ transform: 'translateY(-50%)' }} />
          
          {PROCESS_STEPS.map((step, index) => (
            <AnimatedSection key={step.number} animation="fadeInUp">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="h-full hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 relative">
                  {/* Gradient accent on hover */}
                  <div className="absolute inset-0 bg-gradient-accent opacity-0 hover:opacity-5 rounded-lg transition-opacity duration-300" />
                  
                  <CardHeader className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center mb-4 shadow-accent">
                      <span style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl font-bold text-white">
                        {step.number}
                      </span>
                    </div>
                    <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-xl">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-sm pt-2">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </Section>
    </>
  )
}

export default ContractingServicesPage

