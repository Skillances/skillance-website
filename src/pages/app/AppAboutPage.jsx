import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Target, Users, Zap, Heart, Sparkles, Rocket, Shield, TrendingUp } from 'lucide-react'
import { APP_INFO, APP_STATS } from '@/utils/appConstants'
import DownloadCTA from '@/components/app/DownloadCTA'
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
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                  }}
                >
                  <Sparkles size={20} className="text-white" />
                  <span className="text-white font-semibold text-sm">What Makes Us Special</span>
                </motion.div>
                
                <h2 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-[var(--color-section-primary)] to-[var(--color-section-secondary)] bg-clip-text text-transparent"
                >
                  Your Trusted Marketplace
                </h2>
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Rocket, title: 'Lightning Fast', desc: 'Find and book services in seconds' },
                { icon: Shield, title: 'Fully Verified', desc: 'All freelancers ID-verified' },
                { icon: TrendingUp, title: 'Growing Daily', desc: 'Join thousands of users' },
              ].map((item, index) => (
                <AnimatedSection key={item.title} animation="fadeInUp">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className="text-center border-2 border-transparent hover:border-[var(--color-section-primary)] transition-all duration-300">
                      <CardContent className="pt-6">
                        <motion.div
                          className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                          style={{
                            background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                          }}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <item.icon size={32} className="text-white" />
                        </motion.div>
                        <h3 
                          style={{ fontFamily: 'var(--font-family-poppins)' }}
                          className="text-xl font-bold mb-2"
                        >
                          {item.title}
                        </h3>
                        <p className="text-text-secondary">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
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
                        src="/app_icon.png"
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
                  What We <span className="bg-gradient-to-r from-[var(--color-section-primary)] to-[var(--color-section-secondary)] bg-clip-text text-transparent">Stand For</span>
                </h2>
                <p className="text-lg text-text-secondary">
                  Our core values guide everything we do
                </p>
              </motion.div>
            </AnimatedSection>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              const colors = [
                { bg: 'rgba(20, 184, 166, 0.1)', border: '#14B8A6', icon: '#14B8A6' },
                { bg: 'rgba(139, 92, 246, 0.1)', border: '#8B5CF6', icon: '#8B5CF6' },
                { bg: 'rgba(249, 115, 22, 0.1)', border: '#F97316', icon: '#F97316' },
                { bg: 'rgba(236, 72, 153, 0.1)', border: '#EC4899', icon: '#EC4899' },
              ]
              const color = colors[index % colors.length]
              
              return (
                <AnimatedSection key={value.title} animation="fadeInUp">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Card 
                      className="h-full hover:shadow-2xl transition-all duration-300 border-2 relative overflow-hidden group"
                      style={{ borderColor: color.border, borderOpacity: 0.3 }}
                    >
                      {/* Animated gradient background on hover */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${color.bg}, transparent)`,
                        }}
                      />
                      
                      <CardHeader className="relative z-10">
                        <motion.div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
                          style={{ backgroundColor: color.bg }}
                          whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon size={32} style={{ color: color.icon }} />
                          
                          {/* Pulse effect */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl"
                            style={{ backgroundColor: color.icon, opacity: 0.2 }}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.2, 0, 0.2],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </motion.div>
                        
                        <CardTitle 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-2xl mb-3 group-hover:text-[var(--color-section-primary)] transition-colors"
                        >
                          {value.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {value.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
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
                The Problem We're <span className="bg-gradient-to-r from-[var(--color-section-primary)] to-[var(--color-section-secondary)] bg-clip-text text-transparent">Solving</span>
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
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl font-bold">
                        ✗
                      </div>
                      <h3 
                        style={{ fontFamily: 'var(--font-family-poppins)' }}
                        className="text-2xl font-bold text-red-900"
                      >
                        Before Skillance
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      'Endless searching and asking around',
                      'No way to verify skills or reliability',
                      'Juggling multiple platforms',
                      'Unsafe payment methods',
                      'No accountability or reviews',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-red-600 text-sm">✗</span>
                        </div>
                        <p className="text-gray-700">{item}</p>
                      </motion.div>
                    ))}
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
                    <div className="flex items-center gap-3 mb-4">
                      <motion.div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                        style={{ background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        ✓
                      </motion.div>
                      <h3 
                        style={{ fontFamily: 'var(--font-family-poppins)' }}
                        className="text-2xl font-bold text-green-900"
                      >
                        With Skillance
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      'Find verified pros instantly',
                      'ID-verified freelancers',
                      'All-in-one platform',
                      'Secure in-app payments',
                      'Verified reviews & ratings',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-600 text-sm">✓</span>
                        </div>
                        <p className="text-gray-700 font-medium">{item}</p>
                      </motion.div>
                    ))}
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

