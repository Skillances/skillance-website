import { useState, useEffect, useRef } from 'react'
import { motion, useSpring } from 'framer-motion'

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const scaleX = useSpring(scrollProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.002,
  })

  const [topPosition, setTopPosition] = useState(0)
  const rafRef = useRef(null)
  const lastPositionRef = useRef(0)
  const lastProgressRef = useRef(0)

  useEffect(() => {
    const updatePosition = () => {
      // Get scroll position from Lenis if available, otherwise use window.scrollY
      let currentScrollY = 0
      if (typeof window !== 'undefined') {
        if (window.lenis) {
          currentScrollY = window.lenis.scroll
        } else {
          currentScrollY = window.scrollY
        }
      }

      // Calculate scroll progress (0 to 1)
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = documentHeight > 0 ? Math.min(currentScrollY / documentHeight, 1) : 0

      // Only update if position or progress changed significantly
      if (Math.abs(currentScrollY - lastPositionRef.current) < 1 && Math.abs(progress - lastProgressRef.current) < 0.001) {
        rafRef.current = requestAnimationFrame(updatePosition)
        return
      }

      lastPositionRef.current = currentScrollY
      lastProgressRef.current = progress
      setScrollProgress(progress)

      // SectionToggle is visible when scrollY < 5
      // Header is at top: 0px when SectionToggle is hidden, 56px when visible
      const isSectionToggleVisible = currentScrollY < 5
      const headerHeight = isSectionToggleVisible ? 56 : 0
      
      // Position the progress bar right below the header
      setTopPosition(headerHeight)

      rafRef.current = requestAnimationFrame(updatePosition)
    }

    // Initial position check
    updatePosition()

    // Also listen to Lenis scroll events if available
    let lenisScrollHandler = null
    if (typeof window !== 'undefined' && window.lenis) {
      lenisScrollHandler = () => {
        updatePosition()
      }
      window.lenis.on('scroll', lenisScrollHandler)
    }

    // Fallback to native scroll events
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (lenisScrollHandler && typeof window !== 'undefined' && window.lenis) {
        window.lenis.off('scroll', lenisScrollHandler)
      }
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updatePosition)
    }
  }, [])

  return (
    <motion.div
      className="fixed left-0 right-0 h-1 z-50 origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))',
        top: topPosition,
      }}
      initial={{ top: 0 }}
      animate={{ top: topPosition }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
    />
  )
}

export default ScrollProgress
