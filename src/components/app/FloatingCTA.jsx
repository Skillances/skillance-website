import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { APP_INFO } from '@/utils/appConstants'

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isNearFooter, setIsNearFooter] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (e.g., 600px)
      const scrollPosition = window.scrollY
      const heroHeight = 600
      setIsVisible(scrollPosition > heroHeight)

      // Hide when near footer
      const footerOffset = document.body.scrollHeight - window.innerHeight - 300
      setIsNearFooter(scrollPosition > footerOffset)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isComingSoon = APP_INFO.status === 'Coming Soon'

  return (
    <AnimatePresence>
      {isVisible && !isNearFooter && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.button
            className="flex items-center gap-3 px-6 py-4 rounded-full text-white font-semibold shadow-2xl"
            style={{ backgroundColor: 'var(--color-section-primary)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 20px 60px -15px rgba(37, 99, 235, 0.3)',
                '0 20px 60px -15px rgba(124, 58, 237, 0.3)',
                '0 20px 60px -15px rgba(37, 99, 235, 0.3)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <span>
              {isComingSoon ? 'Coming Soon!' : 'Download App'}
            </span>
          </motion.button>

          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: 'var(--color-section-primary)' }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FloatingCTA

