import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSectionContext } from '@/context/SectionContext'
import { APP_NAVIGATION } from '@/utils/appConstants'
import { CONTRACTING_NAVIGATION } from '@/utils/contractingConstants'
import { APP_INFO } from '@/utils/appConstants'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'

const MobileMenu = ({ isOpen, onClose, onShowComingSoon }) => {
  const location = useLocation()
  const { isApp } = useSectionContext()
  
  const navigation = isApp ? APP_NAVIGATION : CONTRACTING_NAVIGATION
  const isComingSoon = isApp && APP_INFO.status === 'Coming Soon'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Menu - Enhanced Design */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 z-50 md:hidden overflow-hidden"
            style={{ top: '56px' }}
          >
            {/* Gradient background */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, #FFFFFF 0%, #F9FAFB 100%)',
              }}
            />
            
            {/* Decorative gradient orb */}
            <div 
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl"
              style={{
                background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
              }}
            />

            <div className="flex flex-col h-full p-6 relative z-10">
              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={onClose}
                      style={{ fontFamily: 'var(--font-family-inter)' }}
                      className={`flex items-center justify-between text-base font-medium transition-all py-3.5 px-4 rounded-xl touch-target group ${
                        location.pathname === item.path
                          ? 'text-white shadow-lg'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white hover:shadow-md'
                      }`}
                      style={
                        location.pathname === item.path
                          ? {
                              background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                            }
                          : {}
                      }
                    >
                      <span>{item.name}</span>
                      {location.pathname === item.path && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <ArrowRight size={18} />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA Button */}
              <motion.div
                className="mt-auto pt-6 space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isComingSoon ? (
                  <Button
                    onClick={() => {
                      onShowComingSoon()
                      onClose()
                    }}
                    className="w-full touch-target-lg relative overflow-hidden group shadow-lg hover:shadow-xl transition-all"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
                    />
                    <Sparkles size={18} className="mr-2" />
                    <span className="relative z-10">Get the App</span>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full touch-target-lg shadow-lg hover:shadow-xl transition-all"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
                    }}
                  >
                    <Link to="/contact" onClick={onClose} className="flex items-center justify-center">
                      <span>{isApp ? 'Get the App' : 'Get Started'}</span>
                      <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </Button>
                )}

                {/* App info */}
                {isApp && isComingSoon && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center text-xs text-text-tertiary"
                  >
                    Coming April 2026
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu
