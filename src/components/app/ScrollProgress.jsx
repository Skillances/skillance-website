import { useState, useEffect, useRef } from 'react'
import { motion, useSpring } from 'framer-motion'

const PROGRESS_THRESHOLD = 0.004
const TOGGLE_VISIBLE_SCROLL = 5

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const scaleX = useSpring(scrollProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.002,
  })

  const [topPosition, setTopPosition] = useState(0)
  const rafRef = useRef(null)
  const lastProgressRef = useRef(0)
  const lastTopRef = useRef(0)

  useEffect(() => {
    let ticking = false
    const updatePosition = () => {
      let currentScrollY = 0
      if (typeof window !== 'undefined') {
        if (window.lenis) {
          currentScrollY = window.lenis.scroll
        } else {
          currentScrollY = window.scrollY
        }
      }

      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = documentHeight > 0 ? Math.min(currentScrollY / documentHeight, 1) : 0
      const isSectionToggleVisible = currentScrollY < TOGGLE_VISIBLE_SCROLL
      const headerHeight = isSectionToggleVisible ? 56 : 0

      const progressChanged = Math.abs(progress - lastProgressRef.current) >= PROGRESS_THRESHOLD
      const topChanged = headerHeight !== lastTopRef.current

      if (progressChanged) {
        lastProgressRef.current = progress
        setScrollProgress(progress)
      }
      if (topChanged) {
        lastTopRef.current = headerHeight
        setTopPosition(headerHeight)
      }

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        rafRef.current = requestAnimationFrame(updatePosition)
      }
    }

    updatePosition()

    let lenisScrollHandler = null
    if (typeof window !== 'undefined' && window.lenis) {
      lenisScrollHandler = onScroll
      window.lenis.on('scroll', lenisScrollHandler)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (lenisScrollHandler && typeof window !== 'undefined' && window.lenis) {
        window.lenis.off('scroll', lenisScrollHandler)
      }
      window.removeEventListener('scroll', onScroll)
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
        transition: 'top 0.2s ease-out',
      }}
    />
  )
}

export default ScrollProgress
