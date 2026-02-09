import { ParallaxLayer } from '@react-spring/parallax'
import { HOW_IT_WORKS_CUSTOMERS } from '@/utils/appConstants'
import GlassShape from '../GlassShape'
import FloatingSymbol from '../FloatingSymbol'
import FogLayer from '../FogLayer'

/**
 * HowItWorksScene - Matches reference design exactly
 * Diagonal composition, connected by flowing line
 */
const HowItWorksScene = () => {
  const steps = HOW_IT_WORKS_CUSTOMERS.slice(0, 3)

  return (
    <>
      {/* Scene 3 background */}
      <ParallaxLayer offset={2} speed={0.1}>
        <div 
          className="absolute inset-0"
          style={{ 
            background: "linear-gradient(135deg, hsl(180 20% 4%) 0%, hsl(180 20% 6%) 50%, hsl(180 20% 4%) 100%)" 
          }}
        />
        <FogLayer variant="full" intensity="light" />
      </ParallaxLayer>

      {/* Flowing connector line */}
      <ParallaxLayer offset={2} speed={0.2}>
        <svg 
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="flowLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(174 72% 40%)" stopOpacity="0" />
              <stop offset="30%" stopColor="hsl(174 84% 48%)" stopOpacity="0.8" />
              <stop offset="70%" stopColor="hsl(168 84% 78%)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="hsl(168 84% 78%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M10,20 Q30,20 40,40 T70,60 T90,80" 
            fill="none" 
            stroke="url(#flowLine)" 
            strokeWidth="0.3"
          />
        </svg>
      </ParallaxLayer>

      {/* Step nodes */}
      <ParallaxLayer offset={2} speed={0.35}>
        {/* Step 1 */}
        <div className="absolute top-[20%] left-[10%] md:left-[15%]">
          <div className="flex items-start gap-6">
            <div className="relative">
              <GlassShape variant="orb" size={100} />
              <div className="absolute inset-0 flex items-center justify-center">
                <FloatingSymbol symbol="magnifier" size={50} />
              </div>
            </div>
            <div className="pt-4">
              <span className="text-sm text-teal-mint font-medium">01</span>
              <h3 
                style={{ fontFamily: 'var(--font-family-poppins)' }}
                className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
              >
                {steps[0]?.title || 'Search'}
              </h3>
              <p 
                style={{ fontFamily: 'var(--font-family-inter)' }}
                className="text-text-secondary max-w-xs text-sm leading-relaxed"
              >
                {steps[0]?.description || 'Find services by location, ratings, and availability'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Step 2 */}
        <div className="absolute top-[45%] left-[30%] md:left-[35%]">
          <div className="flex items-start gap-6">
            <div className="relative">
              <GlassShape variant="orb" size={100} />
              <div className="absolute inset-0 flex items-center justify-center">
                <FloatingSymbol symbol="message" size={50} />
              </div>
            </div>
            <div className="pt-4">
              <span className="text-sm text-teal-mint font-medium">02</span>
              <h3 
                style={{ fontFamily: 'var(--font-family-poppins)' }}
                className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
              >
                {steps[1]?.title || 'Connect'}
              </h3>
              <p 
                style={{ fontFamily: 'var(--font-family-inter)' }}
                className="text-text-secondary max-w-xs text-sm leading-relaxed"
              >
                {steps[1]?.description || 'Message directly, discuss needs, schedule time'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Step 3 */}
        <div className="absolute top-[70%] left-[50%] md:left-[55%]">
          <div className="flex items-start gap-6">
            <div className="relative">
              <GlassShape variant="orb" size={100} />
              <div className="absolute inset-0 flex items-center justify-center">
                <FloatingSymbol symbol="star" size={50} />
              </div>
            </div>
            <div className="pt-4">
              <span className="text-sm text-teal-mint font-medium">03</span>
              <h3 
                style={{ fontFamily: 'var(--font-family-poppins)' }}
                className="text-2xl md:text-3xl font-semibold text-foreground mb-2"
              >
                {steps[2]?.title || 'Book & Review'}
              </h3>
              <p 
                style={{ fontFamily: 'var(--font-family-inter)' }}
                className="text-text-secondary max-w-xs text-sm leading-relaxed"
              >
                {steps[2]?.description || 'Secure booking, then share your experience'}
              </p>
            </div>
          </div>
        </div>
      </ParallaxLayer>

      {/* How it works label */}
      <ParallaxLayer offset={2} speed={0.6}>
        <div className="absolute top-8 left-6 md:left-12">
          <span className="inline-block px-4 py-2 text-sm font-medium text-teal-mint glass-subtle rounded-full">
            How it works
          </span>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default HowItWorksScene
