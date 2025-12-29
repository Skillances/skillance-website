import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const [topPosition, setTopPosition] = useState(136) // Default: 56px (SectionToggle) + 80px (Header)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      // SectionToggle is visible when scrollY < 5
      // Header is at 56px when SectionToggle visible, 0px when hidden
      // Header height is approximately 80px
      const isSectionToggleVisible = currentScrollY < 5
      const headerTop = isSectionToggleVisible ? 56 : 0
      const headerHeight = 80 // Approximate header height
      setTopPosition(headerTop + headerHeight)
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

