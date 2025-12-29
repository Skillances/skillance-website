import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { APP_INFO } from '@/utils/appConstants'
import ComingSoonModal from './ComingSoonModal'

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isNearFooter, setIsNearFooter] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY
          const heroHeight = 600
          setIsVisible(scrollPosition > heroHeight)

          // Hide when near footer
          const footerOffset = document.body.scrollHeight - window.innerHeight - 300
          setIsNearFooter(scrollPosition > footerOffset)
          
          ticking = false
        })
        ticking = true
      }
    }

    handleScroll() // Check initial position
    window.addEventListener('scroll', handleScroll, { passive: true })

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
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-8 right-8 z-40"
        >
          <motion.button
            onClick={() => isComingSoon && setIsModalOpen(true)}
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
      
      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </AnimatePresence>
  )
}

export default FloatingCTA

