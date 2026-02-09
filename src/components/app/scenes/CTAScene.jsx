import { ParallaxLayer } from '@react-spring/parallax'
import DownloadCTA from '../DownloadCTA'
import GlassShape from '../GlassShape'
import { APP_STATS } from '@/utils/appConstants'

/**
 * CTAScene - Matches reference design exactly
 * Stats flowing upward, large call to action
 */
const CTAScene = () => {
  const stats = APP_STATS && APP_STATS.length > 0 ? APP_STATS : [
    { value: "50K+", label: "Happy customers" },
    { value: "10K+", label: "Verified pros" },
    { value: "4.9", label: "Average rating" },
  ]

  return (
    <>
      {/* Scene 5 background */}
      <ParallaxLayer offset={4} speed={0.1}>
        <div 
          className="absolute inset-0"
          style={{ 
            background: `
              radial-gradient(ellipse 100% 50% at 50% 100%, hsl(174 72% 40% / 0.2), transparent 60%),
              linear-gradient(0deg, hsl(180 20% 6%) 0%, hsl(180 20% 4%) 100%)
            ` 
          }}
        />
      </ParallaxLayer>

      {/* Floating prisms */}
      <ParallaxLayer offset={4} speed={0.25}>
        <div className="absolute top-[10%] left-[10%] opacity-20 rotate-12">
          <GlassShape variant="prism" size={120} />
        </div>
        <div className="absolute top-[20%] right-[15%] opacity-15 -rotate-6">
          <GlassShape variant="prism" size={180} />
        </div>
        <div className="absolute bottom-[30%] left-[20%] opacity-25 rotate-[-15deg]">
          <GlassShape variant="shard" size={80} />
        </div>
      </ParallaxLayer>

      {/* Stats */}
      <ParallaxLayer offset={4} speed={0.35}>
        <div className="absolute bottom-[35%] left-1/2 -translate-x-1/2 flex gap-16 md:gap-24">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div 
                style={{ fontFamily: 'var(--font-family-poppins)' }}
                className="text-4xl md:text-5xl font-semibold text-gradient mb-2"
              >
                {stat.value}
              </div>
              <div 
                style={{ fontFamily: 'var(--font-family-inter)' }}
                className="text-sm text-text-secondary"
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </ParallaxLayer>

      {/* CTA content */}
      <ParallaxLayer offset={4} speed={0.5}>
        <div className="h-screen flex flex-col items-center justify-center px-6 text-center">
            <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight max-w-3xl"
          >
            Ready to find your
            <br />
            <span className="text-gradient">perfect match?</span>
          </h2>
          
          <p 
            style={{ fontFamily: 'var(--font-family-inter)' }}
            className="text-lg md:text-xl text-text-secondary mb-12 max-w-xl"
          >
            Join thousands who've discovered trusted local experts through Skillance.
          </p>
          
          <div>
            <DownloadCTA variant="full" />
          </div>
        </div>
      </ParallaxLayer>

      {/* Footer attribution */}
      <ParallaxLayer offset={4} speed={0.6}>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p 
            style={{ fontFamily: 'var(--font-family-inter)' }}
            className="text-sm text-text-secondary"
          >
            © 2024 Skillance. Connecting communities with trusted experts.
          </p>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default CTAScene
