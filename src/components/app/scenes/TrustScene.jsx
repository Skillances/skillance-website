import { ParallaxLayer } from '@react-spring/parallax'
import FloatingSymbol from '../FloatingSymbol'
import GlassShape from '../GlassShape'

/**
 * TrustScene - Matches reference design exactly
 * Shield as central anchor, radiating trust signals
 */
const TrustScene = () => {
  const trustItems = [
    { label: "Verified identities", desc: "Every pro passes background checks" },
    { label: "Secure payments", desc: "Protected transactions, every time" },
    { label: "Insured services", desc: "Coverage for peace of mind" },
    { label: "24/7 support", desc: "Real humans, always available" },
  ]

  return (
    <>
      {/* Scene 4 background */}
      <ParallaxLayer offset={3} speed={0.1}>
        <div 
          className="absolute inset-0"
          style={{ 
            background: "radial-gradient(ellipse 100% 100% at 50% 40%, hsl(174 62% 28% / 0.1), transparent 60%)" 
          }}
        />
      </ParallaxLayer>

      {/* Large decorative ring */}
      <ParallaxLayer offset={3} speed={0.2}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15">
          <GlassShape variant="ring" size={600} />
        </div>
      </ParallaxLayer>

      {/* Shield anchor */}
      <ParallaxLayer offset={3} speed={0.4} sticky={{ start: 3, end: 3.5 }}>
        <div className="absolute top-1/2 right-[15%] md:right-[20%] -translate-y-1/2">
          <FloatingSymbol symbol="shield" size={280} className="animate-float" />
        </div>
      </ParallaxLayer>

      {/* Trust content */}
      <ParallaxLayer offset={3} speed={0.5}>
        <div className="h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-2xl">
          <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-teal-mint glass-subtle rounded-full w-fit">
            Trust & Safety
          </span>
            <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-8 leading-tight"
          >
            Your security,
            <br />
            <span className="text-gradient">our priority</span>
          </h2>
          
          <div className="space-y-6">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-teal-mint" />
                <div>
                  <h4 
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                    className="font-medium text-foreground"
                  >
                    {item.label}
                  </h4>
                  <p 
                    style={{ fontFamily: 'var(--font-family-inter)' }}
                    className="text-sm text-text-secondary"
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default TrustScene
