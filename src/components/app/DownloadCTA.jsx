import { motion } from 'framer-motion'
import { useState } from 'react'
import { APP_INFO } from '@/utils/appConstants'
import AnimatedSection from '@/components/common/AnimatedSection'
import MagneticElement from './MagneticElement'
import GlowEffect from './GlowEffect'

// Custom Android icon component
const AndroidIcon = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.43 11.43 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.81 10.81 0 0 0 1 18h22a10.81 10.81 0 0 0-5.4-8.52M7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5" />
  </svg>
)

const StoreBadge = ({ href, disabled = false, store = 'google' }) => {
  const [isHovered, setIsHovered] = useState(false)
  const altText = 'Download on the App Store and Get it on Google Play'
  const imageSrc = '/get_it_on.png'
  
  if (disabled) {
    return (
      <motion.div
        className="relative inline-block"
        whileHover={{ scale: 1.05 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <img 
          src={imageSrc}
          alt={altText}
          className="w-[180px] sm:w-[230px] h-auto opacity-70 cursor-not-allowed"
        />
        {/* Coming soon overlay */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-text-secondary bg-white px-3 py-1 rounded-full shadow-lg"
          >
            Coming Soon
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <MagneticElement strength={0.15} range={150}>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="relative inline-block cursor-pointer touch-target"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <GlowEffect glowColor="var(--color-section-primary)" glowOpacity={0.3}>
          <img 
            src={imageSrc}
            alt={altText}
            className="w-[180px] sm:w-[230px] h-auto"
          />
        </GlowEffect>
        {/* Ripple effect on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{ backgroundColor: 'var(--color-section-primary)' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.a>
    </MagneticElement>
  )
}

const DownloadCTA = ({ variant = 'default' }) => {
  const isComingSoon = APP_INFO.status === 'Coming Soon'

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 items-center sm:items-start">
        {isComingSoon ? (
          <StoreBadge href="#" disabled store="google" />
        ) : (
          <StoreBadge href={APP_INFO.playStoreUrl} store="google" />
        )}
      </div>
    )
  }

  // Full section variant
  return (
    <AnimatedSection animation="fadeInUp">
      <motion.div 
        className="rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, var(--color-section-primary) 0%, var(--color-section-secondary) 100%)`
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity"
          style={{
            background: `radial-gradient(circle at center, white, transparent 70%)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }} 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
          >
            {isComingSoon ? 'Get Ready to Download Skillance' : 'Download Skillance Today'}
          </h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
            {isComingSoon 
              ? 'Be the first to know when Skillance launches. Join thousands of customers and freelancers ready to connect.'
              : 'Join thousands of customers finding trusted freelancers and freelancers growing their business'
            }
          </p>

          {isComingSoon ? (
            <div className="flex justify-center items-center">
              <StoreBadge href="#" disabled store="google" />
            </div>
          ) : (
            <div className="flex justify-center items-center">
              <StoreBadge href={APP_INFO.playStoreUrl} store="google" />
            </div>
          )}

          {isComingSoon && (
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm opacity-75">
              Available for iOS and Android devices
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatedSection>
  )
}

export default DownloadCTA

