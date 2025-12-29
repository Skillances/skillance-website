import { useState, useEffect } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.002,
  })

  const [topPosition, setTopPosition] = useState(56) // Start at SectionToggle height

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          // SectionToggle is visible when scrollY < 5
          const isSectionToggleVisible = currentScrollY < 5
          
          if (isSectionToggleVisible) {
            // When SectionToggle is visible, position below it
            setTopPosition(56)
          } else {
            // When SectionToggle is hidden, position at the very top
            setTopPosition(0)
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    // Check initial position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <motion.div
      className="fixed left-0 right-0 h-1 z-50 origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))',
      }}
      animate={{
        top: topPosition,
      }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1], // Smooth easing
      }}
    />
  )
}

export default ScrollProgress

