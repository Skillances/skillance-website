import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, Smartphone, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSectionContext, routeMapping, appRoutes, contractingRoutes } from '@/context/SectionContext'
import { APP_NAVIGATION } from '@/utils/appConstants'
import { CONTRACTING_NAVIGATION } from '@/utils/contractingConstants'
import { APP_INFO } from '@/utils/appConstants'
import MobileMenu from './MobileMenu'
import ComingSoonModal from '@/components/app/ComingSoonModal'
import { motion } from 'framer-motion'

const APP_COLOR = '#14B8A6'
const CONTRACTING_COLOR = '#1E3A8A'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const lastScrollYRef = useRef(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { isApp, activeSection, toggleSection } = useSectionContext()

  const navigation = isApp ? APP_NAVIGATION : CONTRACTING_NAVIGATION
  const isHomePage = location.pathname === '/' && isApp

  const handleSectionChange = (newSection) => {
    if (newSection === activeSection) return

    const currentPath = location.pathname
    const validRoutes = newSection === 'app' ? appRoutes : contractingRoutes
    const routeExists = validRoutes.includes(currentPath)
    
    if (routeExists) {
      toggleSection(newSection)
    } else {
      const mappedRoute = routeMapping[currentPath]
      if (mappedRoute && validRoutes.includes(mappedRoute)) {
        toggleSection(newSection)
        navigate(mappedRoute)
      } else {
        toggleSection(newSection)
        navigate('/')
      }
    }
  }

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const lastScrollY = lastScrollYRef.current
          lastScrollYRef.current = currentScrollY

          setIsScrolled(currentScrollY > 20)

          if (isHomePage) {
            if (currentScrollY < 10) {
              setIsHeaderVisible(true)
            } else if (currentScrollY > lastScrollY) {
              setIsHeaderVisible(false)
            } else if (currentScrollY < lastScrollY) {
              setIsHeaderVisible(true)
            }
          } else {
            setIsHeaderVisible(true)
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  const headerClasses = isHomePage 
    ? 'bg-white/70 backdrop-blur-md shadow-sm py-3'
    : isScrolled 
      ? 'bg-white/95 backdrop-blur-sm shadow-md py-2.5' 
      : 'bg-transparent py-3'

  return (
    <>
      <header
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${headerClasses}`}
        style={{ 
          top: '0px',
          transform: isHomePage && !isHeaderVisible ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'background-color 0.3s ease, padding 0.3s ease, transform 0.3s ease'
        }}
      >
        <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px]">
          <div className="flex items-center h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 touch-target shrink-0 mr-8">
              <img
                src="/app_icon.png"
                alt="Skillance"
                width={32}
                height={32}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span 
                style={{ 
                  fontFamily: 'var(--font-family-poppins)',
                  color: 'var(--color-section-primary)'
                }} 
                className="text-lg sm:text-xl font-bold hidden sm:block"
              >
                Skillance
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 mr-6">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    location.pathname === item.path
                      ? 'text-text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Section Toggle Pill - centered via flex-grow spacers */}
            <div className="hidden lg:flex flex-1 justify-center">
              <div className="relative inline-flex rounded-full bg-gray-100 p-1" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <motion.div
                  className="absolute top-1 bottom-1 rounded-full"
                  animate={{
                    x: activeSection === 'app' ? 0 : '100%',
                    backgroundColor: activeSection === 'app' ? APP_COLOR : CONTRACTING_COLOR,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  style={{ width: 'calc(50% - 2px)', left: '4px' }}
                />
                <button
                  onClick={() => handleSectionChange('app')}
                  className={`relative z-10 px-5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    activeSection === 'app'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ fontFamily: 'var(--font-family-inter)', height: '34px' }}
                >
                  <Smartphone size={15} />
                  <span>The App</span>
                </button>
                
                <button
                  onClick={() => handleSectionChange('contracting')}
                  className={`relative z-10 px-5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${
                    activeSection === 'contracting'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={{ fontFamily: 'var(--font-family-inter)', height: '34px' }}
                >
                  <Code2 size={15} />
                  <span>Services</span>
                </button>
              </div>
            </div>

            {/* Right side CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3 shrink-0 ml-6">
              {isApp && (
                <Button 
                  variant="ghost" 
                  className="font-medium text-sm text-text-secondary hover:text-text-primary"
                  asChild
                >
                  <Link to="/contact">Become a Freelancer</Link>
                </Button>
              )}
              
              {isApp && APP_INFO.status === 'Coming Soon' ? (
                <Button 
                  onClick={() => setIsComingSoonModalOpen(true)}
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                  className="rounded-full px-5 text-sm"
                >
                  Get the App
                </Button>
              ) : (
                <Button 
                  asChild
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                  className="rounded-full px-5 text-sm"
                >
                  <Link to="/contact">{isApp ? 'Get the App' : 'Get Started'}</Link>
                </Button>
              )}
            </div>

            {/* Mobile: Toggle pill + hamburger */}
            <div className="lg:hidden flex items-center gap-3 ml-auto">
              {/* Compact section toggle for tablet */}
              <div className="hidden sm:inline-flex relative rounded-full bg-gray-100 p-0.5" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                <motion.div
                  className="absolute top-0.5 bottom-0.5 rounded-full"
                  animate={{
                    x: activeSection === 'app' ? 0 : '100%',
                    backgroundColor: activeSection === 'app' ? APP_COLOR : CONTRACTING_COLOR,
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  style={{ width: 'calc(50% - 1px)', left: '2px' }}
                />
                <button
                  onClick={() => handleSectionChange('app')}
                  className={`relative z-10 px-3 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                    activeSection === 'app'
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                  style={{ height: '30px' }}
                >
                  <Smartphone size={13} />
                  <span>App</span>
                </button>
                <button
                  onClick={() => handleSectionChange('contracting')}
                  className={`relative z-10 px-3 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                    activeSection === 'contracting'
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                  style={{ height: '30px' }}
                >
                  <Code2 size={13} />
                  <span>Services</span>
                </button>
              </div>

              <motion.button
                className="p-2.5 touch-target-lg relative rounded-lg hover:bg-gray-100 transition-colors"
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
                        style={{ background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))' }}
                        initial={false}
                        animate={{ scaleX: 1 }}
                      />
                      <motion.span
                        className="block w-full h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))' }}
                        initial={false}
                        animate={{ scaleX: 0.8 }}
                      />
                      <motion.span
                        className="block w-full h-0.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--color-section-primary), var(--color-section-secondary))' }}
                        initial={false}
                        animate={{ scaleX: 1 }}
                      />
                    </div>
                  )}
                </div>
              </motion.button>
            </div>
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
