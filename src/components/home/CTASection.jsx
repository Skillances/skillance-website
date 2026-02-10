import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '@/components/common/AnimatedSection'
import { motion } from 'framer-motion'

const CTASection = () => {
  return (
    <div className="relative">
      {/* Solid background */}
      <div className="absolute inset-0 rounded-2xl" style={{ backgroundColor: 'var(--color-section-primary)' }} />
      
      <div className="relative z-10 p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
        <AnimatedSection animation="fadeInUp">
          <div className="text-center max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto text-white">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8">
              Ready to Start Your Project?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-7 md:mb-8 lg:mb-10">
              Let's discuss how we can help bring your ideas to life with our expert development team.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                asChild
                className="bg-white text-[var(--color-section-primary)] border-0 hover:bg-white/95 transition-all font-semibold"
              >
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </Button>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}

export default CTASection
