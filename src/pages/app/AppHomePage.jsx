import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import ParallaxHero from '@/components/app/ParallaxHero'
import AnimatedStats from '@/components/app/AnimatedStats'
import VideoShowcase from '@/components/app/VideoShowcase'
import InteractiveDemo from '@/components/app/InteractiveDemo'
import CategoryGrid from '@/components/app/CategoryGrid'
import HowItWorks from '@/components/app/HowItWorks'
import ComparisonSection from '@/components/app/ComparisonSection'
import Testimonials from '@/components/app/Testimonials'
import TrustSection from '@/components/app/TrustSection'
import DownloadCTA from '@/components/app/DownloadCTA'
import FloatingCTA from '@/components/app/FloatingCTA'

const AppHomePage = () => {
  return (
    <>
      {/* Floating Download Button */}
      <FloatingCTA />

      {/* Enhanced Hero with Parallax */}
      <ParallaxHero />

      {/* Animated Statistics Bar */}
      <AnimatedStats />

      {/* Video Showcase Section */}
      <VideoShowcase />

      {/* Interactive Feature Demo */}
      <InteractiveDemo />

      {/* How It Works - Interactive Timeline */}
      <Section background="grey">
        <HowItWorks userType="customers" />
      </Section>

      {/* Service Categories - Enhanced */}
      <Section>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <AnimatedSection animation="fadeInUp">
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Explore Service Categories
            </h2>
            <p className="text-lg text-text-secondary">
              Find the perfect freelancer for any task across 13+ categories
            </p>
          </AnimatedSection>
        </div>
        <CategoryGrid limit={8} />
        <div className="text-center mt-12">
          <AnimatedSection animation="fadeInUp">
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="group"
            >
              <Link to="/categories">
                View All Categories
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </Section>

      {/* Comparison Section */}
      <Section background="grey">
        <ComparisonSection />
      </Section>

      {/* Testimonials Carousel */}
      <Testimonials />

      {/* Trust & Security - Enhanced */}
      <Section background="grey">
        <TrustSection />
      </Section>

      {/* Final Download CTA */}
      <Section>
        <DownloadCTA />
      </Section>
    </>
  )
}

export default AppHomePage

