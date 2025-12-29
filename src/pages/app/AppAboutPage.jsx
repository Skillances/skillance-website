import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Target, Users, Zap, Heart } from 'lucide-react'
import { APP_INFO, APP_STATS } from '@/utils/appConstants'
import DownloadCTA from '@/components/app/DownloadCTA'
import ScrollProgress from '@/components/app/ScrollProgress'
import FloatingCTA from '@/components/app/FloatingCTA'
import AnimatedStats from '@/components/app/AnimatedStats'
import TrustSection from '@/components/app/TrustSection'
import { motion } from 'framer-motion'

const AppAboutPage = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To connect people with verified, skilled freelancers in their community, making it easy to get things done.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building a trusted marketplace where freelancers and customers can connect with confidence.',
    },
    {
      icon: Zap,
      title: 'Simplicity',
      description: 'Making it effortless to find, book, and pay for services with just a few taps.',
    },
    {
      icon: Heart,
      title: 'Quality',
      description: 'Ensuring every freelancer is verified and every service meets our high standards.',
    },
  ]

  return (
    <>
      {/* Scroll Progress Indicator */}
      <ScrollProgress />

      {/* Floating Download Button */}
      <FloatingCTA />

      <PageHeader
        title="About Skillance"
        subtitle="Connecting customers with trusted freelancers"
        breadcrumb={['Home', 'About']}
      />

      {/* Animated Statistics */}
      <AnimatedStats />

      {/* About Content */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-12">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }} 
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                What is Skillance?
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                Skillance is a mobile marketplace platform built with Flutter that connects customers with 
                verified freelancers across a wide range of services. The app features intelligent routing 
                with splash screen authentication checks, onboarding flows, and separate customer and 
                freelancer navigation shells. Whether you need a tutor, mechanic, cleaner, or fitness trainer, 
                Skillance makes it easy to find trusted professionals near you through category browsing, 
                proximity search, and smart filtering.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed mb-6">
                For customers, the app provides a seamless experience: discover services through category 
                carousels with animated icons, search with debounced filters, view comprehensive freelancer 
                profiles, message before booking, select service details with real-time pricing, pay securely 
                with multiple payment methods, and manage all bookings in one place with status tracking 
                and notifications.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                For freelancers, Skillance provides powerful business management tools: complete profile 
                creation with verification, dashboard with earnings and performance metrics, job management 
                system to accept/decline bookings, integrated chat for coordination, earnings tracking with 
                automatic payout calculations, and availability management. The platform uses provider-based 
                architecture for state management, ensuring smooth data flow and real-time updates across 
                all features.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </Section>

      {/* Values */}
      <Section background="grey">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What We Stand For
            </h2>
            <p className="text-lg text-text-secondary">
              Our core values guide everything we do
            </p>
          </AnimatedSection>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            
            return (
              <AnimatedSection key={value.title} animation="fadeInUp">
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div 
                        className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: 'var(--color-surface-variant)' }}
                      >
                        <Icon size={28} style={{ color: 'var(--color-section-primary)' }} />
                      </div>
                      <CardTitle 
                        style={{ fontFamily: 'var(--font-family-poppins)' }} 
                        className="text-2xl mb-3"
                      >
                        {value.title}
                      </CardTitle>
                      <CardDescription className="text-base">
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

      {/* The Story */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-8">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }} 
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                The Problem We're Solving
              </h2>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fadeInUp">
            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
              <p>
                Finding reliable freelancers has always been challenging. Traditional methods involve 
                word-of-mouth recommendations, searching through classified ads, or scrolling through 
                countless profiles without knowing who to trust.
              </p>
              <p>
                For freelancers, building a client base and managing bookings often means juggling 
                multiple platforms, spreadsheets, and communication tools. It's time-consuming and 
                inefficient.
              </p>
              <p>
                Skillance solves these problems by providing a single, trusted platform where verified 
                freelancers and customers can connect. With location-based matching, secure payments, 
                verified reviews, and powerful business tools, we're making it easier than ever to 
                get things done.
              </p>
            </div>
          </AnimatedSection>
        </div>
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

export default AppAboutPage

