import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.002,
  })

  const [topPosition, setTopPosition] = useState(136) // Default: 56px (SectionToggle) + 80px (Header)

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          // SectionToggle is visible when scrollY < 5
          // Header is at 56px when SectionToggle visible, 0px when hidden
          // Header height is approximately 80px
          const isSectionToggleVisible = currentScrollY < 5
          const headerTop = isSectionToggleVisible ? 56 : 0
          const headerHeight = 80 // Approximate header height
          setTopPosition(headerTop + headerHeight)
          
          ticking = false
        })
        ticking = true
      }
    }

    // Check initial position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed left-0 right-0 h-1 z-40 origin-left"
      style={{
        top: `${topPosition}px`,
        scaleX,
        background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))',
        transition: 'top 0.3s ease-in-out',
      }}
    />
  )
}

export default ScrollProgress

