import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '@/components/common/AnimatedSection'
import { motion } from 'framer-motion'

const CTASection = () => {
  return (
    <div className="relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-primary rounded-2xl opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-section-primary)] via-[var(--color-accent-teal)] to-[var(--color-accent-cyan)] rounded-2xl opacity-90" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
      
      <div className="relative z-10 p-12 md:p-16">
        <AnimatedSection animation="fadeInUp">
          <div className="text-center max-w-3xl mx-auto text-white">
            <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Project?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Let's discuss how we can help bring your ideas to life with our expert development team.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                asChild
                className="bg-white text-[var(--color-section-primary)] border-0 shadow-professional-xl hover:shadow-accent-lg hover:bg-white/95 transition-all font-semibold"
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
