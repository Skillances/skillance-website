import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { NAVIGATION } from '@/utils/constants'
import { Button } from '@/components/ui/button'

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation()

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

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg z-50 md:hidden"
          >
            <div className="flex flex-col h-full p-6 pt-20">
              <nav className="flex flex-col space-y-4">
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    style={{ fontFamily: 'var(--font-family-inter)' }}
                    className={`text-base font-medium transition-colors hover:text-primary py-2 ${
                      location.pathname === item.path
                        ? 'text-primary'
                        : 'text-text-secondary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8">
                <Button asChild className="w-full">
                  <Link to="/contact" onClick={onClose}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu
