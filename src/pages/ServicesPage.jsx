import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Smartphone, Globe, Code } from 'lucide-react'
import { SERVICES, PROCESS_STEPS } from '@/utils/constants'
import { Link } from 'react-router-dom'

const iconMap = {
  Smartphone,
  Globe,
  Code,
}

const ServicesPage = () => {
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
                <Card className="overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-8 p-8">
                    <div>
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-surface-variant)' }}>
                        <Icon size={32} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl mb-4">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-base mb-6">
                        {service.description}
                      </CardDescription>
                      <Button asChild>
                        <Link to="/contact">Get a Quote</Link>
                      </Button>
                    </div>

                    <div>
                      <h4 style={{ fontFamily: 'var(--font-family-poppins)' }} className="font-semibold text-lg mb-4">
                        Key Features
                      </h4>
                      <ul className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check size={20} style={{ color: 'var(--color-success)' }} className="mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-text-secondary">{feature}</span>
                          </li>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROCESS_STEPS.map((step, index) => (
            <AnimatedSection key={step.number} animation="fadeInUp">
              <Card className="h-full">
                <CardHeader>
                  <div style={{ fontFamily: 'var(--font-family-poppins)', color: 'var(--color-secondary-teal)' }} className="text-4xl font-bold mb-2">
                    {step.number}
                  </div>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-xl">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-sm pt-2">
                    {step.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Section>
    </>
  )
}

export default ServicesPage
