import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STATS } from '@/utils/constants'

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] sm:min-h-screen flex items-center pt-16 sm:pt-20 md:pt-24 bg-white overflow-hidden">

      <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] 3xl:max-w-[1800px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8"
          >
              <h1 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-[1.1] sm:leading-tight">
                Building Digital
                <span className="block" style={{ color: 'var(--color-section-primary)' }}>Solutions</span>
                That Matter
              </h1>

            <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-sm sm:text-base md:text-lg lg:text-xl text-text-secondary max-w-lg lg:max-w-xl">
              We create innovative mobile and web applications that help businesses
              thrive in the digital age. From concept to launch, we're with you every step.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  asChild
                  className="w-full sm:w-auto text-white border-0 transition-all touch-target-lg"
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                >
                  <Link to="/contact" className="flex items-center justify-center">
                    Get Started
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto"
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="w-full sm:w-auto border-2 hover:border-[var(--color-accent-teal)] hover:text-[var(--color-accent-teal)] transition-all touch-target-lg"
                >
                  <Link to="/portfolio" className="flex items-center justify-center">
                    View Our Work
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 md:pt-8">
              {STATS.slice(0, 3).map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <div style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-text-secondary">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - App Icon */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative mt-6 sm:mt-8 lg:mt-0"
          >
            <div className="relative aspect-square max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--color-surface-variant)' }}>
              <motion.img
                src="/app-icon.png"
                alt="Skillance App"
                className="w-full h-full object-contain p-4 sm:p-6 md:p-8 lg:p-10 relative z-10"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
