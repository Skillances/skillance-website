import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSectionContext } from '@/context/SectionContext'
import { APP_NAVIGATION } from '@/utils/appConstants'
import { CONTRACTING_NAVIGATION } from '@/utils/contractingConstants'
import { APP_INFO } from '@/utils/appConstants'
import MobileMenu from './MobileMenu'
import ComingSoonModal from '@/components/app/ComingSoonModal'
import { motion } from 'framer-motion'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSectionToggleVisible, setIsSectionToggleVisible] = useState(true)
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const { isApp } = useSectionContext()

  const navigation = isApp ? APP_NAVIGATION : CONTRACTING_NAVIGATION

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          setIsScrolled(currentScrollY > 20)
          
          // Track SectionToggle visibility - only visible at top
          setIsSectionToggleVisible(currentScrollY < 5)
          
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3 md:py-4' : 'bg-transparent py-4 md:py-6'
        }`}
        style={{ 
          top: isSectionToggleVisible ? '56px' : '0px',
          transition: 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, padding 0.3s ease'
        }}
      >
        <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 touch-target">
              <img 
                src="/app_icon.png" 
                alt="Skillance" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span 
                style={{ 
                  fontFamily: 'var(--font-family-poppins)',
                  color: 'var(--color-section-primary)'
                }} 
                className="text-lg sm:text-xl font-bold"
              >
                Skillance
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className={`text-sm font-medium transition-colors py-2 ${
                    location.pathname === item.path
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              {isApp && APP_INFO.status === 'Coming Soon' ? (
                <Button 
                  onClick={() => setIsComingSoonModalOpen(true)}
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                >
                  Get the App
                </Button>
              ) : (
                <Button 
                  asChild
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                >
                  <Link to="/contact">{isApp ? 'Get the App' : 'Get Started'}</Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Toggle - Enhanced Hamburger */}
            <motion.button
              className="md:hidden p-2.5 touch-target-lg relative rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                {isMobileMenuOpen ? (
                  <motion.div
                    initial={{ rotate: 0, opacity: 0 }}
                    animate={{ rotate: 90, opacity: 1 }}
                    exit={{ rotate: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} style={{ color: 'var(--color-section-primary)' }} strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <div className="space-y-1.5 w-full">
                    <motion.span
                      className="block w-full h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))',
                      }}
                      initial={false}
                      animate={{ scaleX: 1 }}
                      whileHover={{ scaleX: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className="block w-full h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))',
                      }}
                      initial={false}
                      animate={{ scaleX: 0.8 }}
                      whileHover={{ scaleX: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                    <motion.span
                      className="block w-full h-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))',
                      }}
                      initial={false}
                      animate={{ scaleX: 1 }}
                      whileHover={{ scaleX: 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}
              </div>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onShowComingSoon={() => setIsComingSoonModalOpen(true)}
      />

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={isComingSoonModalOpen}
        onClose={() => setIsComingSoonModalOpen(false)}
      />
    </>
  )
}

export default Header
