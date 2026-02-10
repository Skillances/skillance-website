import { useEffect, useRef, forwardRef } from 'react'
import { Parallax } from '@react-spring/parallax'
import Lenis from 'lenis'

/**
 * ParallaxWithLenis - Integrates Lenis smooth scrolling with react-spring/parallax
 * Lenis handles smooth scrolling, react-spring handles parallax effects
 * 
 * NOTE: react-spring/parallax has its own scroll handling which may conflict with Lenis.
 * For best compatibility, Lenis integration is disabled by default. Enable at your own risk.
 */
const ParallaxWithLenis = forwardRef(({ children, pages = 5, className = '' }, ref) => {
  const parallaxRef = useRef(null)
  const lenisRef = useRef(null)
  
  // Forward ref to parallax
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(parallaxRef.current)
      } else if (ref) {
        ref.current = parallaxRef.current
      }
    }
  }, [ref])

  useEffect(() => {
    // WARNING: react-spring/parallax creates its own scroll container
    // Integrating Lenis directly may cause conflicts. 
    // This is a simplified approach - for production, consider using one or the other.
    
    // For now, we'll skip Lenis integration on parallax pages
    // and let react-spring handle scrolling natively
    // If you want smooth scrolling, you can enable this but test thoroughly
    
    const enableLenis = false // Set to true to enable (may cause conflicts)
    
    if (!enableLenis) {
      return // Skip Lenis integration
    }

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    lenisRef.current = lenis

    // RAF loop for Lenis
    let rafId = null
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Sync Lenis scroll with react-spring/parallax
    lenis.on('scroll', ({ scroll, limit, velocity, direction, progress }) => {
      if (parallaxRef.current) {
        const parallaxProgress = progress * (pages - 1)
        parallaxRef.current.scrollTo(parallaxProgress)
      }
    })

    // Expose Lenis globally
    if (typeof window !== 'undefined') {
      window.lenis = lenis
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      lenis.destroy()
      if (typeof window !== 'undefined') {
        delete window.lenis
      }
    }
  }, [pages])

  return (
    <Parallax
      ref={parallaxRef}
      pages={pages}
      className={className}
      config={{ tension: 200, friction: 50, mass: 0.5 }}
    >
      {children}
    </Parallax>
  )
})

ParallaxWithLenis.displayName = 'ParallaxWithLenis'

export default ParallaxWithLenis
