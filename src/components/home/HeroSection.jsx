import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STATS } from '@/utils/constants'
import { parallaxVariants } from '@/utils/animations'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-white overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-accent-teal))',
            top: '10%',
            left: '-10%',
          }}
          animate={parallaxVariants.slow}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-8"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-cyan), var(--color-section-primary))',
            bottom: '20%',
            right: '-5%',
          }}
          animate={parallaxVariants.medium}
        />
      </div>

      <div className="container mx-auto container-padding max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
              <h1 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Building Digital
                <span className="block text-gradient-primary">Solutions</span>
                That Matter
              </h1>

            <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-lg md:text-xl text-text-secondary max-w-lg">
              We create innovative mobile and web applications that help businesses
              thrive in the digital age. From concept to launch, we're with you every step.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  asChild
                  className="bg-gradient-primary text-white border-0 shadow-professional-lg hover:shadow-accent-lg transition-all"
                >
                  <Link to="/contact">
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="border-2 hover:border-[var(--color-accent-teal)] hover:text-[var(--color-accent-teal)] transition-all"
                >
                  <Link to="/portfolio">
                    View Our Work
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {STATS.slice(0, 3).map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <div style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - App Icon */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square bg-gradient-subtle rounded-lg flex items-center justify-center overflow-hidden shadow-professional-lg">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-accent-teal)] opacity-5" />
              
              <motion.img
                src="/app_icon.png"
                alt="Skillance App"
                className="w-full h-full object-contain p-8 relative z-10"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              />
              
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-accent opacity-10 blur-2xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-primary opacity-10 blur-xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
