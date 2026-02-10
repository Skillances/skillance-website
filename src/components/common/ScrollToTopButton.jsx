import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const SCROLL_THRESHOLD = 300

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)
  const lastVisibleRef = useRef(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const visible = window.scrollY > SCROLL_THRESHOLD
          if (visible !== lastVisibleRef.current) {
            lastVisibleRef.current = visible
            setIsVisible(visible)
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 touch-target-lg"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
          }}
          aria-label="Scroll to top"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp size={24} className="text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default ScrollToTopButton

