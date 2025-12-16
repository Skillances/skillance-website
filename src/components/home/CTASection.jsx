import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '@/components/common/AnimatedSection'

const CTASection = () => {
  return (
    <AnimatedSection animation="fadeInUp">
      <div className="text-center max-w-3xl mx-auto">
        <h2 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Ready to Start Your Project?
        </h2>
        <p className="text-lg md:text-xl text-text-secondary mb-8">
          Let's discuss how we can help bring your ideas to life with our expert development team.
        </p>
        <Button size="lg" asChild>
          <Link to="/contact">
            Get in Touch
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </Button>
      </div>
    </AnimatedSection>
  )
}

export default CTASection
