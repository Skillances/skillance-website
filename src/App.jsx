import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SectionProvider, useSectionContext } from './context/SectionContext'
import { AuthProvider } from './context/AuthContext'
import SectionToggle from './components/layout/SectionToggle'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollProgress from './components/app/ScrollProgress'
import ScrollToTopButton from './components/common/ScrollToTopButton'
import ProtectedRoute from './components/common/ProtectedRoute'

// Lazy load pages for better performance
const AppHomePage = lazy(() => import('./pages/app/AppHomePage'))
const AppAboutPage = lazy(() => import('./pages/app/AppAboutPage'))
const AppFeaturesPage = lazy(() => import('./pages/app/AppFeaturesPage'))
const AppCategoriesPage = lazy(() => import('./pages/app/AppCategoriesPage'))
const AppContactPage = lazy(() => import('./pages/app/AppContactPage'))
const AppPrivacyPage = lazy(() => import('./pages/app/AppPrivacyPage'))
const AppTermsPage = lazy(() => import('./pages/app/AppTermsPage'))

const ContractingHomePage = lazy(() => import('./pages/contracting/ContractingHomePage'))
const ContractingAboutPage = lazy(() => import('./pages/contracting/ContractingAboutPage'))
const ContractingServicesPage = lazy(() => import('./pages/contracting/ContractingServicesPage'))
const ContractingPortfolioPage = lazy(() => import('./pages/contracting/ContractingPortfolioPage'))
const ContractingContactPage = lazy(() => import('./pages/contracting/ContractingContactPage'))
const ContractingPrivacyPage = lazy(() => import('./pages/contracting/ContractingPrivacyPage'))
const ContractingTermsPage = lazy(() => import('./pages/contracting/ContractingTermsPage'))

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AdminRoutes = lazy(() => import('./components/layout/AdminRoutes'))

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-section-primary)]"></div>
  </div>
)

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
      <Routes>
        {/* Admin Routes - Separate layout without header/footer */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Suspense fallback={<PageLoader />}>
                <AdminRoutes />
              </Suspense>
            </ProtectedRoute>
          } 
        />

        {/* Public Routes - Normal layout with header/footer */}
        <Route path="*" element={
          <>
            <SectionToggle />
            <ScrollProgress />
            <ScrollToTopButton />
            <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
              <Header />
              <main className="flex-grow overflow-x-hidden">
                <Suspense fallback={<PageLoader />}>
                  {isApp ? (
                    <Routes>
                      <Route path="/" element={<AppHomePage />} />
                      <Route path="/features" element={<AppFeaturesPage />} />
                      <Route path="/categories" element={<AppCategoriesPage />} />
                      <Route path="/about" element={<AppAboutPage />} />
                      <Route path="/contact" element={<AppContactPage />} />
                      <Route path="/login" element={<LoginPage />} />
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
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/privacy" element={<ContractingPrivacyPage />} />
                      <Route path="/terms" element={<ContractingTermsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  )}
                </Suspense>
              </main>
              <Footer />
            </div>
          </>
        } />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SectionProvider>
          <ScrollToTop />
          <AppContent />
          <Analytics />
        </SectionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
