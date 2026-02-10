import { ParallaxLayer } from '@react-spring/parallax'
import { ChevronDown } from 'lucide-react'
import DownloadCTA from '../DownloadCTA'
import TextRotator from '../TextRotator'
import GlassShape from '../GlassShape'
import FogLayer from '../FogLayer'

/**
 * HeroScene - Matches reference design exactly
 * Deep ambient glow, floating orb as anchor, typography flows around
 */
const HeroScene = () => {

  return (
    <>
      {/* Background ambience - slowest layer */}
      <ParallaxLayer offset={0} speed={0.1}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
        <div 
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] h-[80%] opacity-40"
          style={{ 
            background: "radial-gradient(ellipse at center, rgba(20, 184, 166, 0.25), transparent 60%)" 
          }}
        />
        <FogLayer variant="ambient" intensity="medium" />
      </ParallaxLayer>

      {/* Floating background shapes - slow layer */}
      <ParallaxLayer offset={0} speed={0.2}>
        <div className="absolute top-[15%] left-[5%] opacity-30">
          <GlassShape variant="ring" size={300} />
        </div>
        <div className="absolute top-[60%] right-[8%] opacity-20">
          <GlassShape variant="arc" size={400} />
        </div>
      </ParallaxLayer>

      {/* Logo is now in StickyLogo component - removed from here */}

      {/* Hero content - foreground, fastest - centered like reference */}
      <ParallaxLayer offset={0} speed={0.6}>
        <div className="h-screen flex flex-col items-center justify-center px-6 text-center relative z-10" style={{ paddingTop: '100px' }}>
          <span className="inline-block px-5 py-2.5 mb-8 text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full">
            Coming Soon
          </span>
          
          <div className="mb-4">
            <span 
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-2xl md:text-3xl font-bold text-[var(--color-section-primary)]"
            >
              Skillance
            </span>
          </div>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight mb-8 max-w-5xl"
            style={{ fontFamily: 'var(--font-family-poppins)' }}
          >
            <span className="block text-foreground">Find <TextRotator
              words={['trusted', 'verified', 'skilled', 'expert']}
              className="font-semibold text-[var(--color-section-primary)]"
              interval={2500}
            /> freelancers</span>
            <span className="block text-gradient mt-2">near you</span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-text-secondary max-w-xl mb-12 leading-relaxed"
            style={{ fontFamily: 'var(--font-family-inter)' }}
          >
            Connect with verified professionals for 13+ services. From tutors to mechanics, find the perfect match in your area.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="glass-card glass-hover glass-rounded-lg p-5 md:p-7">
              <DownloadCTA variant="hero" />
            </div>
          </div>
          
          {/* Scroll indicator */}
          <button 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-secondary hover:text-[var(--color-section-primary)] transition-colors"
          >
            <span className="text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
            <ChevronDown size={20} className="animate-bounce" />
          </button>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default HeroScene
