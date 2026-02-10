import { ParallaxLayer } from '@react-spring/parallax'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

/**
 * StickyLogo - Logo that stays sticky across ALL scenes
 * Uses factor to span all pages, sticky to keep it in place
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
    <ParallaxLayer
      offset={0}
      speed={0.4}
      factor={6} // Span all 6 pages
      sticky={{ start: 0, end: 5.99 }} // Sticky across all scenes
      style={{ 
        zIndex: 2, 
        pointerEvents: 'none',
      }}
    >
      <motion.div 
        className="absolute top-1/2 left-[10%] -translate-y-1/2"
        style={{
          width: isMobile ? 'clamp(200px, 50vw, 300px)' : 'clamp(300px, 35vw, 500px)',
          height: isMobile ? 'clamp(200px, 50vw, 300px)' : 'clamp(300px, 35vw, 500px)',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="glass-orb rounded-full relative w-full h-full">
          <div 
            className="absolute inset-[15%] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(94, 234, 212, 0.2), transparent 70%)',
              filter: 'blur(20px)',
              zIndex: 1,
            }}
          />
          <div 
            className="absolute top-[10%] left-[20%] w-[40%] h-[15%] rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
              filter: 'blur(8px)',
              transform: 'rotate(-15deg)',
              zIndex: 2,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
            <img
              src="/3D-Logo-Parallax.png"
              alt="Skillance 3D Logo"
              className="w-[70%] h-auto"
              style={{
                filter: 'drop-shadow(0 20px 60px rgba(20, 184, 166, 0.4))',
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                display: 'block',
              }}
            />
          </div>
        </div>
      </motion.div>
    </ParallaxLayer>
  )
}

export default StickyLogo
