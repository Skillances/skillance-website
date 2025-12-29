import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSectionContext, routeMapping, appRoutes, contractingRoutes } from '@/context/SectionContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Smartphone, Code2 } from 'lucide-react'

const SectionToggle = () => {
  const { activeSection, toggleSection } = useSectionContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSectionChange = (newSection) => {
    // If switching to the same section, do nothing
    if (newSection === activeSection) {
      return
    }

    const currentPath = location.pathname
    
    // Check if current route exists in the new section
    const validRoutes = newSection === 'app' ? appRoutes : contractingRoutes
    const routeExists = validRoutes.includes(currentPath)
    
    if (routeExists) {
      // Route exists in new section, just switch
      toggleSection(newSection)
    } else {
      // Route doesn't exist, try to map it or go to home
      const mappedRoute = routeMapping[currentPath]
      if (mappedRoute && validRoutes.includes(mappedRoute)) {
        // Navigate to mapped route
        toggleSection(newSection)
        navigate(mappedRoute)
      } else {
        // No mapping found, go to home
        toggleSection(newSection)
        navigate('/')
      }
    }
  }
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          
          // Only show when at the very top of the page
          setIsVisible(currentScrollY < 5)
          
          setLastScrollY(currentScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    // Check initial scroll position
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            mass: 0.8,
            opacity: { duration: 0.25 }
          }}
          className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm"
        >
          <div className="container mx-auto container-padding max-w-7xl">
            <div className="flex items-center justify-center py-2">
              <div className="inline-flex rounded-lg bg-surface-variant p-1">
                <button
                  onClick={() => handleSectionChange('app')}
                  className={`relative px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'app'
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                >
                  {activeSection === 'app' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundColor: 'var(--color-section-primary)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Smartphone size={18} className="relative z-10" />
                  <span className="relative z-10">The App</span>
                </button>
                
                <button
                  onClick={() => handleSectionChange('contracting')}
                  className={`relative px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeSection === 'contracting'
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                >
                  {activeSection === 'contracting' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundColor: 'var(--color-section-primary)' }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Code2 size={18} className="relative z-10" />
                  <span className="relative z-10">Contracting Services</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SectionToggle

