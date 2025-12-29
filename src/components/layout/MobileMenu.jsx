import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSectionContext } from '@/context/SectionContext'
import { APP_NAVIGATION } from '@/utils/appConstants'
import { CONTRACTING_NAVIGATION } from '@/utils/contractingConstants'
import { Button } from '@/components/ui/button'

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { isApp } = useSectionContext()
  
  const navigation = isApp ? APP_NAVIGATION : CONTRACTING_NAVIGATION

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
            style={{ top: '56px' }}
          >
            <div className="flex flex-col h-full p-6">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    style={{ fontFamily: 'var(--font-family-inter)' }}
                    className={`text-base font-medium transition-colors py-2 ${
                      location.pathname === item.path
                        ? 'text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-8">
                <Button 
                  asChild 
                  className="w-full"
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                >
                  <Link to="/contact" onClick={onClose}>
                    {isApp ? 'Get the App' : 'Get Started'}
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
