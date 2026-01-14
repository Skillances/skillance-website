import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
// Removed excessive icon imports - using minimal design approach
import { APP_INFO, APP_STATS } from '@/utils/appConstants'
import DownloadCTA from '@/components/app/DownloadCTA'
import FloatingCTA from '@/components/app/FloatingCTA'
import AnimatedStats from '@/components/app/AnimatedStats'
import TrustSection from '@/components/app/TrustSection'
import { motion } from 'framer-motion'

const AppAboutPage = () => {
  const values = [
    {
      title: 'Our Mission',
      description: 'To connect people with verified, skilled freelancers in their community, making it easy to get things done.',
    },
    {
      title: 'Community First',
      description: 'Building a trusted marketplace where freelancers and customers can connect with confidence.',
    },
    {
      title: 'Simplicity',
      description: 'Making it effortless to find, book, and pay for services with just a few taps.',
    },
    {
      title: 'Quality',
      description: 'Ensuring every freelancer is verified and every service meets our high standards.',
    },
  ]

  return (
    <>
      {/* Floating Download Button */}
      <FloatingCTA />

      <PageHeader
        title="About Skillance"
        subtitle="Connecting customers with trusted freelancers"
        breadcrumb={['Home', 'About']}
      />

      {/* Animated Statistics */}
      <AnimatedStats />

      {/* About Content with Gradient Background */}
      <Section>
        <div className="relative overflow-hidden py-8">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 opacity-5"
            animate={{
              background: [
                'linear-gradient(135deg, var(--color-section-primary) 0%, var(--color-section-secondary) 100%)',
                'linear-gradient(135deg, var(--color-section-secondary) 0%, var(--color-section-primary) 100%)',
                'linear-gradient(135deg, var(--color-section-primary) 0%, var(--color-section-secondary) 100%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-64 h-64 rounded-full opacity-10"
              style={{
                background: 'radial-gradient(circle, var(--color-section-primary), transparent)',
                top: '10%',
                right: '10%',
              }}
              animate={{
                y: [0, -30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-48 h-48 rounded-full opacity-10"
              style={{
                background: 'radial-gradient(circle, var(--color-section-secondary), transparent)',
                bottom: '20%',
                left: '5%',
              }}
              animate={{
                y: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <AnimatedSection animation="fadeInUp">
              <div className="text-center mb-16">
                <h2 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                >
                  Your Trusted Marketplace
                </h2>
                <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
                  Connecting customers with verified freelancers in your community
                </p>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                { title: 'Lightning Fast', desc: 'Find and book services in seconds' },
                { title: 'Fully Verified', desc: 'All freelancers ID-verified' },
                { title: 'Growing Daily', desc: 'Join thousands of users' },
              ].map((item, index) => (
                <AnimatedSection key={item.title} animation="fadeInUp">
                  <div className="text-center">
                    <div 
                      className="text-4xl md:text-5xl font-bold mb-3"
                      style={{ 
                        fontFamily: 'var(--font-family-poppins)',
                        color: 'var(--color-section-primary)'
                      }}
                    >
                      {index === 0 && '⚡'}
                      {index === 1 && '✓'}
                      {index === 2 && '📈'}
                    </div>
                    <h3 
                      style={{ fontFamily: 'var(--font-family-poppins)' }}
                      className="text-xl font-bold mb-2"
                    >
                      {item.title}
                    </h3>
                    <p className="text-text-secondary">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection animation="fadeInUp">
              <Card className="overflow-hidden border-2" style={{ borderColor: 'var(--color-section-primary)', borderOpacity: 0.2 }}>
                <CardContent className="p-8">
                  <div className="space-y-6 text-base md:text-lg text-text-secondary leading-relaxed">
                    <div className="relative">
                      {/* App icon as drop cap */}
                      <motion.img
                        src="/app-icon.png"
                        alt="Skillance"
                        className="float-left mr-3 mb-2 rounded-xl shadow-lg"
                        style={{
                          width: '60px',
                          height: '60px',
                          shapeOutside: 'circle(50%)',
                        }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      />
                      <p>
                        <strong className="text-text-primary">killance</strong> is a revolutionary mobile marketplace that removes the hassle of finding skilled professionals. No more asking around or relying on word of mouth – find verified freelancers instantly through smart category browsing, proximity search, and intelligent filtering.
                      </p>
                    </div>
                    <p>
                      <strong className="text-text-primary">For customers,</strong> we provide a seamless journey: discover services, view comprehensive profiles, message before booking, select details with real-time pricing, pay securely, and manage everything in one place with live tracking.
                    </p>
                    <p>
                      <strong className="text-text-primary">For freelancers,</strong> we offer powerful business tools: profile verification, earnings dashboard, job management, integrated chat, automatic payout calculations, and smart availability management.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </Section>

      {/* Values - Enhanced with gradients and animations */}
      <Section background="grey">
        <div className="relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <AnimatedSection animation="fadeInUp">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                >
                  What We Stand For
                </h2>
                <p className="text-lg text-text-secondary">
                  Our core values guide everything we do
                </p>
              </motion.div>
            </AnimatedSection>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {values.map((value, index) => {
              return (
                <AnimatedSection key={value.title} animation="fadeInUp">
                  <div className="space-y-4">
                    <div 
                      className="text-2xl font-bold"
                      style={{ 
                        fontFamily: 'var(--font-family-poppins)',
                        color: 'var(--color-section-primary)'
                      }}
                    >
                      {value.title}
                    </div>
                    <p className="text-lg text-text-secondary leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                </AnimatedSection>
              )
            })}
          </div>
        </div>
      </Section>

      {/* The Story - With visual timeline */}
      <Section>
        <div className="max-w-5xl mx-auto">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }} 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              >
                The Problem We're Solving
              </h2>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                Transforming how people find and hire skilled professionals
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Before */}
            <AnimatedSection animation="slideInLeft">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50" />
                  <CardHeader>
                    <h3 
                      style={{ fontFamily: 'var(--font-family-poppins)' }}
                      className="text-2xl font-bold text-red-900 mb-4"
                    >
                      Before Skillance
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {[
                        'Endless searching and asking around',
                        'No way to verify skills or reliability',
                        'Juggling multiple platforms',
                        'Unsafe payment methods',
                        'No accountability or reviews',
                      ].map((item, i) => (
                        <li key={i} className="text-gray-700 flex items-start">
                          <span className="text-red-600 mr-3">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>

            {/* After */}
            <AnimatedSection animation="slideInRight">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full blur-3xl opacity-50" />
                  <CardHeader>
                    <h3 
                      style={{ fontFamily: 'var(--font-family-poppins)' }}
                      className="text-2xl font-bold text-green-900 mb-4"
                    >
                      With Skillance
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {[
                        'Find verified pros instantly',
                        'ID-verified freelancers',
                        'All-in-one platform',
                        'Secure in-app payments',
                        'Verified reviews & ratings',
                      ].map((item, i) => (
                        <li key={i} className="text-gray-700 font-medium flex items-start">
                          <span className="text-green-600 mr-3">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatedSection>
          </div>
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

