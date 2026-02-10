import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SectionProvider, useSectionContext } from './context/SectionContext'
import { AuthProvider } from './context/AuthContext'
import { SmoothScrollProvider } from './components/SmoothScrollProvider'
import SectionToggle from './components/layout/SectionToggle'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ScrollProgress from './components/app/ScrollProgress'
import ScrollToTopButton from './components/common/ScrollToTopButton'
import ProtectedRoute from './components/common/ProtectedRoute'

// Lazy load pages for better performance
// AppHomePage is imported normally - it has its own parallax system
import AppHomePage from './pages/app/AppHomePage'
const AppAboutPage = lazy(() => import('./pages/app/AppAboutPage'))
const AppFeaturesPage = lazy(() => import('./pages/app/AppFeaturesPage'))
const AppVideosPage = lazy(() => import('./pages/app/AppVideosPage'))
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
    if (typeof window !== 'undefined') {
      // For parallax homepage, use native scroll
      if (pathname === '/') {
        window.scrollTo(0, 0)
      } else {
        // Use Lenis if available for other pages
        const lenisInstance = window.lenis
        if (lenisInstance) {
          lenisInstance.scrollTo(0, { immediate: true })
        } else {
          window.scrollTo(0, 0)
        }
      }
    }
  }, [pathname])

  return null
}

// Conditional wrapper - no SmoothScrollProvider for homepage
function ConditionalScrollProvider({ children }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  if (isHomePage) {
    return <>{children}</>
  }

  return <SmoothScrollProvider>{children}</SmoothScrollProvider>
}

// Main content component with conditional routing
function AppContent() {
  const { isApp } = useSectionContext()
  const location = useLocation()
  const isHomePage = location.pathname === '/' && isApp

  return (
    <>
      {/* Header always visible, but transparent on parallax homepage */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <Header />
      </div>
      <SectionToggle />
      {!isHomePage && <ScrollProgress />}
      {!isHomePage && <ScrollToTopButton />}
      
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

        {/* App Homepage - Standalone with parallax, no header/footer wrapper */}
        {isApp && (
          <Route 
            path="/" 
            element={<AppHomePage />} 
          />
        )}

        {/* Other App Routes - Normal layout */}
        {isApp && (
          <>
            <Route path="/features" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppFeaturesPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/videos" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppVideosPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/categories" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppCategoriesPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/about" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppAboutPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppContactPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/privacy" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppPrivacyPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/terms" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <AppTermsPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
          </>
        )}

        {/* Contracting Routes */}
        {!isApp && (
          <>
            <Route path="/" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingHomePage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/about" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingAboutPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/services" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingServicesPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/portfolio" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingPortfolioPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/contact" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingContactPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <LoginPage />
              </Suspense>
            } />
            <Route path="/privacy" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingPrivacyPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
            <Route path="/terms" element={
              <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
                <Header />
                <main className="flex-grow overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <ContractingTermsPage />
                  </Suspense>
                </main>
                <Footer />
              </div>
            } />
          </>
        )}

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ paddingTop: '56px' }}>
            <Header />
            <main className="flex-grow overflow-x-hidden">
              <Suspense fallback={<PageLoader />}>
                <NotFoundPage />
              </Suspense>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </>
  )
}

import { ThemeProvider } from './components/common/ThemeProvider'

function App() {
  return (
    <Router>
      <AuthProvider>
        <SectionProvider>
          <ConditionalScrollProvider>
            <ScrollToTop />
            <AppContent />
            <Analytics />
          </ConditionalScrollProvider>
        </SectionProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
