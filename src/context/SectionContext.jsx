import { createContext, useContext, useState, useEffect } from 'react'

const SectionContext = createContext()

export const useSectionContext = () => {
  const context = useContext(SectionContext)
  if (!context) {
    throw new Error('useSectionContext must be used within a SectionProvider')
  }
  return context
}

// Route mapping between sections
export const routeMapping = {
  // App routes -> Contracting routes
  '/features': '/services',
  '/categories': '/portfolio',
  // Contracting routes -> App routes
  '/services': '/features',
  '/portfolio': '/categories',
  // Note: /about, /contact, /privacy, /terms exist in both sections, no mapping needed
}

// Valid routes for each section
export const appRoutes = ['/', '/features', '/categories', '/about', '/contact', '/privacy', '/terms']
export const contractingRoutes = ['/', '/services', '/portfolio', '/about', '/contact', '/privacy', '/terms']

export const SectionProvider = ({ children }) => {
  const [activeSection, setActiveSection] = useState(() => {
    // Get initial section from localStorage or default to 'app'
    const saved = localStorage.getItem('skillance-active-section')
    return saved || 'app'
  })

  useEffect(() => {
    // Update localStorage when section changes
    localStorage.setItem('skillance-active-section', activeSection)
    
    // Update data attribute on document root for CSS theming
    document.documentElement.setAttribute('data-section', activeSection)
  }, [activeSection])

  const toggleSection = (section) => {
    if (section === 'app' || section === 'contracting') {
      setActiveSection(section)
    }
  }

  const value = {
    activeSection,
    toggleSection,
    isApp: activeSection === 'app',
    isContracting: activeSection === 'contracting',
  }

  return (
    <SectionContext.Provider value={value}>
      {children}
    </SectionContext.Provider>
  )
}

export default SectionContext

