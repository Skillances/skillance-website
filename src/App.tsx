import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import PageLoader from './components/layout/PageLoader';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import HelpCenter from './pages/help/HelpCenter';
import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import CookiePolicy from './pages/legal/CookiePolicy';
import FAQPage from './pages/help/FAQPage';
import TrustSafetyPage from './pages/help/TrustSafetyPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import CookieConsent from './components/layout/CookieConsent';
import LaunchCountdown from './components/layout/LaunchCountdown';

gsap.registerPlugin(ScrollTrigger);

// Scroll to top component on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MainContent({ isLoaded }: { isLoaded: boolean }) {
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    if (isLoaded) {
      // Initialize Lenis for smooth scrolling
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        autoRaf: false,
      });

      // Keep ScrollTrigger in sync with Lenis scroll position
      lenis.on('scroll', () => {
        ScrollTrigger.update();
      });

      // Drive Lenis from rAF so it receives proper ms timestamps
      let rafId: number;
      const raf = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      // Refresh ScrollTrigger once layout has settled
      const refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      return () => {
        clearTimeout(refreshTimeout);
        cancelAnimationFrame(rafId);
        lenis.destroy();
      };
    }
  }, [isLoaded]);

  return (
    <div 
      ref={mainRef} 
      className={`relative min-h-screen bg-white transition-opacity duration-1000 ${
        isLoaded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'
      }`}
    >
      <ScrollToTop />
      {!isAdminRoute && !isLoginPage && <Navigation isLoaded={isLoaded} />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/trust-safety" element={<TrustSafetyPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    {/* Add other admin routes here as they are ported */}
                    <Route path="*" element={<AdminDashboard />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isAdminRoute && !isLoginPage && <Footer />}
      {isLoaded && !isAdminRoute && !isLoginPage && (
        <>
          <CookieConsent />
          <LaunchCountdown />
        </>
      )}
    </div>
  );
}

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoaderComplete = () => {
    setIsLoaded(true);
  };

  return (
    <AuthProvider>
      <Router>
        <PageLoader onComplete={handleLoaderComplete} />
        <MainContent isLoaded={isLoaded} />
      </Router>
    </AuthProvider>
  );
}

export default App;
