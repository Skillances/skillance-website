import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STATS } from '@/utils/constants'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 bg-white">
      <div className="container mx-auto container-padding max-w-7xl">
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
              <span className="block" style={{ color: 'var(--color-secondary-teal)' }}>Solutions</span>
              That Matter
            </h1>

            <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-lg md:text-xl text-text-secondary max-w-lg">
              We create innovative mobile and web applications that help businesses
              thrive in the digital age. From concept to launch, we're with you every step.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Get Started
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link to="/portfolio">
                  View Our Work
                </Link>
              </Button>
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

          {/* Right Column - Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square bg-surface-variant rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <div style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-6xl font-bold mb-4">
                  Skillance
                </div>
                <p className="text-text-secondary">Hero Image Placeholder</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
