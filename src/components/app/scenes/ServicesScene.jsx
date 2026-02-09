import { ParallaxLayer } from '@react-spring/parallax'
import { SCENE_OFFSETS } from '@/utils/parallaxConfig'
import { SERVICE_CATEGORIES } from '@/utils/appConstants'
import FloatingSymbol from '../FloatingSymbol'
import GlassShape from '../GlassShape'
import FogLayer from '../FogLayer'
import CategoryLottieSymbol from '../CategoryLottieSymbol'

/**
 * ServicesScene - Matches reference design exactly
 * Symbols scattered in orbital composition, no grid
 */
const ServicesScene = () => {
  const keyCategories = SERVICE_CATEGORIES.slice(0, 6)
  const displayCategories = keyCategories.slice(0, 4) // Only show 4 orbiting symbols like reference

  return (
    <>
      {/* Scene 2 background */}
      <ParallaxLayer offset={SCENE_OFFSETS.SERVICES} speed={0.1}>
        <div 
          className="absolute inset-0"
          style={{ 
            background: "radial-gradient(ellipse 120% 80% at 30% 50%, hsl(174 62% 28% / 0.15), transparent 60%)" 
          }}
        />
        <FogLayer variant="radial" intensity="light" />
      </ParallaxLayer>

      {/* Floating decorative elements */}
      <ParallaxLayer offset={SCENE_OFFSETS.SERVICES} speed={0.15}>
        <div className="absolute top-[20%] right-[15%] opacity-25">
          <GlassShape variant="lens" size={250} />
        </div>
        <div className="absolute bottom-[25%] left-[10%] opacity-20">
          <GlassShape variant="droplet" size={180} />
        </div>
      </ParallaxLayer>

      {/* Service symbols in orbital layout */}
      <ParallaxLayer offset={SCENE_OFFSETS.SERVICES} speed={0.3}>
        {/* Center anchor - magnifier */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <FloatingSymbol symbol="magnifier" size={180} className="animate-float" />
        </div>
        
        {/* Orbiting symbols - using Lottie animations */}
        <div className="absolute top-[20%] left-[20%]">
          <GlassShape variant="orb" size={100} className="animate-float delay-200">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <CategoryLottieSymbol category={displayCategories[0]} size={60} />
            </div>
          </GlassShape>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-text-secondary whitespace-nowrap">
            {displayCategories[0]?.name || 'Service'}
          </span>
        </div>
        
        <div className="absolute top-[15%] right-[25%]">
          <GlassShape variant="orb" size={90} className="animate-float delay-300">
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <CategoryLottieSymbol category={displayCategories[1]} size={54} />
            </div>
          </GlassShape>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-text-secondary whitespace-nowrap">
            {displayCategories[1]?.name || 'Service'}
          </span>
        </div>
        
        <div className="absolute bottom-[30%] left-[15%]">
          <GlassShape variant="orb" size={95} className="animate-float delay-500">
            <div className="absolute inset-0 flex items-center justify-center p-3">
              <CategoryLottieSymbol category={displayCategories[2]} size={57} />
            </div>
          </GlassShape>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-text-secondary whitespace-nowrap">
            {displayCategories[2]?.name || 'Service'}
          </span>
        </div>
        
        <div className="absolute bottom-[25%] right-[20%]">
          <GlassShape variant="orb" size={100} className="animate-float delay-700">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <CategoryLottieSymbol category={displayCategories[3]} size={60} />
            </div>
          </GlassShape>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-text-secondary whitespace-nowrap">
            {displayCategories[3]?.name || 'Service'}
          </span>
        </div>
      </ParallaxLayer>

      {/* Services header */}
      <ParallaxLayer offset={SCENE_OFFSETS.SERVICES} speed={0.5}>
        <div className="h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-2xl">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-teal-mint glass-subtle rounded-full w-fit">
            Services
          </span>
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight"
          >
            One platform,
            <br />
            <span className="text-gradient">endless expertise</span>
          </h2>
          <p 
            style={{ fontFamily: 'var(--font-family-inter)' }}
            className="text-lg text-text-secondary leading-relaxed"
          >
            From home repairs to personal growth, find the right expert for every need. All verified, all trusted.
          </p>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default ServicesScene
