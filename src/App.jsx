import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SectionProvider, useSectionContext } from './context/SectionContext'
import SectionToggle from './components/layout/SectionToggle'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollProgress from './components/app/ScrollProgress'

// App Pages
import AppHomePage from './pages/app/AppHomePage'
import AppAboutPage from './pages/app/AppAboutPage'
import AppFeaturesPage from './pages/app/AppFeaturesPage'
import AppCategoriesPage from './pages/app/AppCategoriesPage'
import AppContactPage from './pages/app/AppContactPage'
import AppPrivacyPage from './pages/app/AppPrivacyPage'
import AppTermsPage from './pages/app/AppTermsPage'

// Contracting Pages
import ContractingHomePage from './pages/contracting/ContractingHomePage'
import ContractingAboutPage from './pages/contracting/ContractingAboutPage'
import ContractingServicesPage from './pages/contracting/ContractingServicesPage'
import ContractingPortfolioPage from './pages/contracting/ContractingPortfolioPage'
import ContractingContactPage from './pages/contracting/ContractingContactPage'
import ContractingPrivacyPage from './pages/contracting/ContractingPrivacyPage'
import ContractingTermsPage from './pages/contracting/ContractingTermsPage'

import NotFoundPage from './pages/NotFoundPage'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Main content component with conditional routing
function AppContent() {
  const { isApp } = useSectionContext()

  return (
    <>
      <SectionToggle />
      <ScrollProgress />
      <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
        <Header />
        <main className="flex-grow overflow-x-hidden">
          {isApp ? (
            <Routes>
              <Route path="/" element={<AppHomePage />} />
              <Route path="/features" element={<AppFeaturesPage />} />
              <Route path="/categories" element={<AppCategoriesPage />} />
              <Route path="/about" element={<AppAboutPage />} />
              <Route path="/contact" element={<AppContactPage />} />
              <Route path="/privacy" element={<AppPrivacyPage />} />
              <Route path="/terms" element={<AppTermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<ContractingHomePage />} />
              <Route path="/about" element={<ContractingAboutPage />} />
              <Route path="/services" element={<ContractingServicesPage />} />
              <Route path="/portfolio" element={<ContractingPortfolioPage />} />
              <Route path="/contact" element={<ContractingContactPage />} />
              <Route path="/privacy" element={<ContractingPrivacyPage />} />
              <Route path="/terms" element={<ContractingTermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          )}
        </main>
        <Footer />
      </div>
    </>
  )
}

function App() {
  return (
    <Router>
      <SectionProvider>
        <ScrollToTop />
        <AppContent />
        <Analytics />
      </SectionProvider>
    </Router>
  )
}

export default App
