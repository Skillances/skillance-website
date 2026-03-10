import { useState, useEffect, useRef, lazy, Suspense } from 'react';
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
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));
const AdminFreelancers = lazy(() => import('./pages/admin/AdminFreelancers'));
const AdminFreelancerDetail = lazy(() => import('./pages/admin/AdminFreelancerDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCustomerDetail = lazy(() => import('./pages/admin/AdminCustomerDetail'));
const AdminVerifications = lazy(() => import('./pages/admin/AdminVerifications'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminSystem = lazy(() => import('./pages/admin/AdminSystem'));
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'));
const AdminNotifySubscribers = lazy(() => import('./pages/admin/AdminNotifySubscribers'));
const AdminWebsiteReviews = lazy(() => import('./pages/admin/AdminWebsiteReviews'));

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-neutral-500">Loading...</p>
      </div>
    </div>
  );
}
import { AuthProvider } from './context/AuthContext';
import { AdminThemeProvider } from './context/AdminThemeContext';
import CookieConsent from './components/layout/CookieConsent';
import LaunchCountdown from './components/layout/LaunchCountdown';
import ScrollIndicator from './components/layout/ScrollIndicator';

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
                <Suspense fallback={<AdminLoadingFallback />}>
                  <AdminThemeProvider>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="users/:userId" element={<AdminUserDetail />} />
                        <Route path="freelancers" element={<AdminFreelancers />} />
                        <Route path="freelancers/:freelancerId" element={<AdminFreelancerDetail />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="customers/:customerId" element={<AdminCustomerDetail />} />
                        <Route path="verifications" element={<AdminVerifications />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="security" element={<AdminSecurity />} />
                        <Route path="audit-logs" element={<AdminAuditLogs />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="contact-messages" element={<AdminContactMessages />} />
                        <Route path="notify-subscribers" element={<AdminNotifySubscribers />} />
                        <Route path="website-reviews" element={<AdminWebsiteReviews />} />
                        <Route path="system" element={<AdminSystem />} />
                        <Route path="*" element={<AdminDashboard />} />
                      </Routes>
                    </AdminLayout>
                  </AdminThemeProvider>
                </Suspense>
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
          <ScrollIndicator />
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
