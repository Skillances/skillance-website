import { Parallax } from '@react-spring/parallax'
import { useEffect, useState } from 'react'
import { prefersReducedMotion, isMobile as checkMobile } from '@/utils/parallaxConfig'

/**
 * ParallaxContainer - Main container for scroll-driven parallax scenes
 * Optimized for smooth performance and cinematic flow
 */
const ParallaxContainer = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    // Disable any existing smooth scroll (Lenis) for parallax
    if (typeof window !== 'undefined') {
      // Stop Lenis if it exists
      if (window.lenis) {
        window.lenis.stop()
      }

      // Check mobile
      const checkIsMobile = () => {
        setMobile(checkMobile())
      }
      checkIsMobile()
      window.addEventListener('resize', checkIsMobile)

      // Check reduced motion preference
      const checkReducedMotion = () => {
        setReducedMotion(prefersReducedMotion())
      }

      checkReducedMotion()

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      mediaQuery.addEventListener('change', checkReducedMotion)

      // Performance: Use will-change for parallax container
      const container = document.querySelector('.parallax-container')
      if (container) {
        container.style.willChange = 'scroll-position'
        container.style.transform = 'translateZ(0)'
      }

      return () => {
        if (window.lenis) {
          window.lenis.start()
        }
        window.removeEventListener('resize', checkIsMobile)
        mediaQuery.removeEventListener('change', checkReducedMotion)
        if (container) {
          container.style.willChange = 'auto'
        }
      }
    }
  }, [])

  // If reduced motion is preferred, render without parallax
  if (reducedMotion) {
    return (
      <div className="parallax-container-static" style={{ width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    )
  }

  return (
    <Parallax
      pages={5}
      className="parallax-container bg-background"
      style={{
        width: '100%',
        height: '100vh',
      }}
      config={{ 
        mass: 1, 
        tension: 280, 
        friction: 60,
        clamp: false,
      }}
    >
      {children}
    </Parallax>
  )
}

export default ParallaxContainer
