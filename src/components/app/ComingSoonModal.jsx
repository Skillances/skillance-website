import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Bell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ComingSoonModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg"
            >
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
                style={{
                  background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                  transform: 'scale(1.1)',
                }}
              />

              {/* Content */}
              <div 
                className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                >
                  <X size={20} className="text-gray-600" />
                </button>

                {/* Animated background gradient */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                  }}
                />

                {/* Sparkles */}
                <div className="absolute top-8 right-12 text-6xl opacity-20 animate-pulse">✨</div>
                <div className="absolute bottom-12 left-8 text-4xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>🎉</div>

                {/* Content */}
                <div className="relative p-8 sm:p-12">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                    }}
                  >
                    <Sparkles size={40} className="text-white" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                    className="text-3xl sm:text-4xl font-bold text-center mb-4"
                    >
                    Something Amazing<br />Is Coming!
                  </motion.h2>

                  {/* Date badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full mx-auto mb-6 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                    }}
                  >
                    <Calendar size={20} className="text-white" />
                    <span 
                      style={{ fontFamily: 'var(--font-family-poppins)' }}
                      className="text-xl font-bold text-white"
                    >
                      April 2026
                    </span>
                  </motion.div>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed"
                  >
                    Skillance is launching soon! Be among the first to experience the future of connecting with skilled professionals.
                  </motion.p>

                  {/* Features */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid gap-3 mb-8"
                  >
                    {[
                      'Find verified professionals instantly',
                      'Secure payments & reviews',
                      '13+ service categories',
                    ].map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-section-primary)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-sm sm:text-base">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Button
                      onClick={onClose}
                      className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                      }}
                    >
                      <Bell size={20} className="mr-2" />
                      Got It!
                    </Button>
                  </motion.div>

                  {/* Footer text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-sm text-gray-500 mt-6"
                  >
                    Available for iOS and Android
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ComingSoonModal

