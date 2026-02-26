import { motion } from 'framer-motion'
import { APP_INFO } from '@/utils/appConstants'
import AnimatedSection from '@/components/common/AnimatedSection'
import { QrCode } from 'lucide-react'

const AppleIcon = ({ className = '' }) => (
  <svg viewBox="0 0 384 512" fill="currentColor" className={className}>
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-62.6 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
)

const PlayIcon = ({ className = '' }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" className={className}>
    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
  </svg>
)

const StoreBadge = ({ href, disabled = false, store = 'google' }) => {
  const isApple = store === 'apple'

  const content = (
    <div className="flex items-center gap-3">
      {isApple ? (
        <AppleIcon className="w-6 h-6 sm:w-7 sm:h-7" />
      ) : (
        <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      )}
      <div className="flex flex-col items-start leading-tight">
        <span className="text-[10px] sm:text-[11px] font-normal opacity-80">
          {isApple ? 'Download on the' : 'GET IT ON'}
        </span>
        <span className="text-sm sm:text-base font-semibold -mt-0.5">
          {isApple ? 'App Store' : 'Google Play'}
        </span>
      </div>
    </div>
  )

  const badgeClasses = `inline-flex items-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gray-900 text-white transition-all ${
    disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-black cursor-pointer'
  }`

  if (disabled) {
    return (
      <motion.div
        className="relative"
        whileHover={{ scale: 1.03 }}
      >
        <div className={badgeClasses}>
          {content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={badgeClasses}
    >
      {content}
    </motion.a>
  )
}

const DownloadCTA = ({ variant = 'default' }) => {
  const isComingSoon = APP_INFO.status === 'Coming Soon'

  if (variant === 'hero') {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4">
        {isComingSoon ? (
          <>
            <StoreBadge href="#" disabled store="apple" />
            <StoreBadge href="#" disabled store="google" />
          </>
        ) : (
          <>
            <StoreBadge href={APP_INFO.appStoreUrl || '#'} store="apple" />
            <StoreBadge href={APP_INFO.playStoreUrl || '#'} store="google" />
          </>
        )}
        
        {/* Desktop QR Code */}
        <div className="hidden md:flex items-center gap-2.5 pl-4 ml-1 border-l border-border/40">
          <div className="p-1.5 bg-white rounded-md shadow-sm">
            <QrCode className="w-7 h-7" style={{ color: 'var(--color-section-primary)' }} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Scan to</span>
            <span className="text-xs font-medium text-text-primary">Download</span>
          </div>
        </div>
      </div>
    )
  }

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
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity"
          style={{ background: `radial-gradient(circle at center, white, transparent 70%)` }}
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

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {isComingSoon ? (
              <>
                <StoreBadge href="#" disabled store="apple" />
                <StoreBadge href="#" disabled store="google" />
              </>
            ) : (
              <>
                <StoreBadge href={APP_INFO.appStoreUrl || '#'} store="apple" />
                <StoreBadge href={APP_INFO.playStoreUrl || '#'} store="google" />
              </>
            )}
          </div>

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
