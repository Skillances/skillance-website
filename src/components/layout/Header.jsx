import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSectionContext } from '@/context/SectionContext'
import { APP_NAVIGATION } from '@/utils/appConstants'
import { CONTRACTING_NAVIGATION } from '@/utils/contractingConstants'
import MobileMenu from './MobileMenu'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSectionToggleVisible, setIsSectionToggleVisible] = useState(true)
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
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-4' : 'bg-transparent py-6'
        }`}
        style={{ 
          top: isSectionToggleVisible ? '56px' : '0px',
          transition: 'top 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, padding 0.3s ease'
        }}
      >
        <div className="container mx-auto container-padding max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/app_icon.png" 
                alt="Skillance" 
                className="w-8 h-8 object-contain"
              />
              <span 
                style={{ 
                  fontFamily: 'var(--font-family-poppins)',
                  color: 'var(--color-section-primary)'
                }} 
                className="text-xl font-bold"
              >
                Skillance
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className={`text-sm font-medium transition-colors ${
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
              <Button 
                asChild
                style={{ backgroundColor: 'var(--color-section-primary)' }}
              >
                <Link to="/contact">{isApp ? 'Get the App' : 'Get Started'}</Link>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  )
}

export default Header
