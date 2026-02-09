import { ParallaxLayer } from '@react-spring/parallax'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import GlassShape from './GlassShape'

/**
 * StickyLogo - Logo that stays sticky across multiple scenes
 * Prevents jumping by using consistent positioning
 */
const StickyLogo = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <>
      {/* Hero anchor orb - sticky only within hero scene (0 to 0.5), then smooth transition */}
      <ParallaxLayer offset={0} speed={0.4} sticky={{ start: 0, end: 0.5 }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <GlassShape variant="orb" size={isMobile ? 280 : 380} className="animate-float-slow">
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/3D-Logo-Parallax.png"
                alt="Skillance 3D Logo"
                className="w-[65%] h-auto"
                style={{
                  filter: 'drop-shadow(0 24px 72px rgba(20, 184, 166, 0.5))',
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  display: 'block',
                }}
              />
            </div>
          </GlassShape>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default StickyLogo
