import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/layout/PageTransition';
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
import RefundPolicy from './pages/legal/RefundPolicy';
import FAQPage from './pages/help/FAQPage';
import TrustSafetyPage from './pages/help/TrustSafetyPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRouteErrorBoundary from './components/common/AdminRouteErrorBoundary';
import { sendClientLog } from './lib/clientLog';
import { AuthProvider } from './context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from './context/AdminThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import CookieConsent from './components/layout/CookieConsent';
import LaunchCountdown from './components/layout/LaunchCountdown';
import ScrollIndicator from './components/layout/ScrollIndicator';
import PublicFaqBot from './components/layout/PublicFaqBot';
import { syncSectionScrollMarginCss } from './lib/sectionScroll';

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRoleApplications = lazy(() => import('./pages/admin/AdminRoleApplications'));
const AdminUserDetail = lazy(() => import('./pages/admin/AdminUserDetail'));
const AdminFreelancers = lazy(() => import('./pages/admin/AdminFreelancers'));
const AdminFreelancerDetail = lazy(() => import('./pages/admin/AdminFreelancerDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminBookingDetail = lazy(() => import('./pages/admin/AdminBookingDetail'));
const AdminCustomerDetail = lazy(() => import('./pages/admin/AdminCustomerDetail'));
const AdminVerifications = lazy(() => import('./pages/admin/AdminVerifications'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminFinance = lazy(() => import('./pages/admin/AdminFinance'));
const AdminFinancePayoutLedger = lazy(() => import('./pages/admin/AdminFinancePayoutLedger'));
const AdminSecurity = lazy(() => import('./pages/admin/AdminSecurity'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminSystem = lazy(() => import('./pages/admin/AdminSystem'));
const AdminObservability = lazy(() => import('./pages/admin/AdminObservability'));
const AdminContactMessages = lazy(() => import('./pages/admin/AdminContactMessages'));
const AdminBugReports = lazy(() => import('./pages/admin/AdminBugReports'));
const AdminNotifySubscribers = lazy(() => import('./pages/admin/AdminNotifySubscribers'));
const AdminWebsiteReviews = lazy(() => import('./pages/admin/AdminWebsiteReviews'));
const AdminBookingReviews = lazy(() => import('./pages/admin/AdminBookingReviews'));
const AdminChatLogs = lazy(() => import('./pages/admin/AdminChatLogs'));
const AdminCompliance = lazy(() => import('./pages/admin/AdminCompliance'));
const AdminAi = lazy(() => import('./pages/admin/AdminAi'));
const AdminCategoryLimitRequests = lazy(() => import('./pages/admin/AdminCategoryLimitRequests'));
const AdminCertificationReviews = lazy(() => import('./pages/admin/AdminCertificationReviews'));
const AdminDigitalProductReviews = lazy(() => import('./pages/admin/AdminDigitalProductReviews'));
const AdminPortfolioReviews = lazy(() => import('./pages/admin/AdminPortfolioReviews'));

gsap.registerPlugin(ScrollTrigger);

// Scroll to top component on route change — skips when a section scroll target is pending
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't scroll to top when navigating to a section anchor on home.
    if (hash.startsWith('#')) return;
    // Backward compatibility for legacy cross-route section jumps.
    if (sessionStorage.getItem('skillance_scroll_to')) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

/** Lazy-route placeholder in the admin main column only — sidebar/top bar stay mounted. */
function AdminInlinePageSkeleton() {
  const { isDark } = useAdminTheme();

  return (
    <div className="space-y-6 w-full">
      <div className={`h-9 w-48 rounded-xl animate-pulse ${isDark ? 'bg-neutral-800' : 'bg-neutral-100'}`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-28 border rounded-2xl animate-pulse ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'}`}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
      <div className={`h-64 border rounded-2xl animate-pulse ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-100'}`} />
    </div>
  );
}

function MainContent({ isLoaded }: { isLoaded: boolean }) {
  const mainRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const routeAnimationKey = isAdminRoute ? '/admin' : location.pathname;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onError = (event: ErrorEvent) => {
      sendClientLog({
        source: 'window.error',
        message: event.message || 'Unhandled window error',
        stack: event.error instanceof Error ? event.error.stack : undefined,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          route: location.pathname,
        },
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      sendClientLog({
        source: 'window.unhandledrejection',
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        metadata: {
          route: location.pathname,
          reasonType: typeof reason,
        },
      });
    };

    const onSecurityPolicyViolation = (event: SecurityPolicyViolationEvent) => {
      sendClientLog({
        level: 'warn',
        source: 'window.securitypolicyviolation',
        message: event.violatedDirective || 'Security policy violation',
        metadata: {
          route: location.pathname,
          blockedURI: event.blockedURI,
          effectiveDirective: event.effectiveDirective,
          originalPolicy: event.originalPolicy,
          sample: event.sample,
          disposition: event.disposition,
        },
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('securitypolicyviolation', onSecurityPolicyViolation);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
      window.removeEventListener('securitypolicyviolation', onSecurityPolicyViolation);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (isLoaded) {
      // Initialize Lenis for smooth scrolling
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        autoRaf: false,
        // Let wheel/trackpad scroll native overflow regions (Services accordions, modals, etc.).
        allowNestedScroll: true,
      });

      // Expose on window so Navigation can use lenis.scrollTo (avoids scrollIntoView conflict)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__lenis = lenis;

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

      const updateScrollMargin = () => syncSectionScrollMarginCss();
      updateScrollMargin();
      window.addEventListener('resize', updateScrollMargin);

      // Refresh ScrollTrigger once layout has settled
      const refreshTimeout = setTimeout(() => {
        updateScrollMargin();
        ScrollTrigger.refresh();
      }, 300);

      return () => {
        window.removeEventListener('resize', updateScrollMargin);
        clearTimeout(refreshTimeout);
        cancelAnimationFrame(rafId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__lenis;
        lenis.destroy();
      };
    }
  }, [isLoaded]);

  return (
    <div 
      ref={mainRef} 
      className={`relative min-h-screen ${isAdminRoute ? 'bg-neutral-950' : 'bg-white'} transition-opacity duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity] ${
        isLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <ScrollToTop />
      {!isAdminRoute && !isLoginPage && <Navigation isLoaded={isLoaded} />}
      <main>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={routeAnimationKey}>
            {/* Public Routes */}
            <Route path="/" element={<PageTransition routeKey="/"><Home /></PageTransition>} />
            <Route path="/help-center" element={<PageTransition routeKey="/help-center"><HelpCenter /></PageTransition>} />
            <Route path="/privacy-policy" element={<PageTransition routeKey="/privacy-policy"><Privacy /></PageTransition>} />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<PageTransition routeKey="/terms"><Terms /></PageTransition>} />
            <Route path="/refund-policy" element={<PageTransition routeKey="/refund-policy"><RefundPolicy /></PageTransition>} />
            <Route path="/cookie-policy" element={<PageTransition routeKey="/cookie-policy"><CookiePolicy /></PageTransition>} />
            <Route path="/faq" element={<PageTransition routeKey="/faq"><FAQPage /></PageTransition>} />
            <Route path="/trust-safety" element={<PageTransition routeKey="/trust-safety"><TrustSafetyPage /></PageTransition>} />
            <Route path="/services" element={<PageTransition routeKey="/services"><ServicesPage /></PageTransition>} />
            <Route path="/contact" element={<PageTransition routeKey="/contact"><ContactPage /></PageTransition>} />
            <Route path="/category/:id" element={<PageTransition routeKey={location.pathname}><CategoryPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition routeKey="/login"><LoginPage /></PageTransition>} />

            {/* Admin Routes — no transition wrapper (has its own layout) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminThemeProvider>
                    <AdminRouteErrorBoundary resetPath={location.pathname}>
                      <AdminLayout>
                        <Suspense fallback={<AdminInlinePageSkeleton />}>
                          <Routes>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="role-applications" element={<AdminRoleApplications />} />
                            <Route path="users/:userId" element={<AdminUserDetail />} />
                            <Route path="freelancers" element={<AdminFreelancers />} />
                            <Route path="freelancers/:freelancerId" element={<AdminFreelancerDetail />} />
                            <Route path="customers" element={<AdminCustomers />} />
                            <Route path="bookings/:bookingId" element={<AdminBookingDetail />} />
                            <Route path="bookings" element={<AdminBookings />} />
                            <Route path="customers/:customerId" element={<AdminCustomerDetail />} />
                            <Route path="verifications" element={<AdminVerifications />} />
                            <Route path="category-limit-requests" element={<AdminCategoryLimitRequests />} />
                            <Route path="certification-reviews" element={<AdminCertificationReviews />} />
                            <Route path="digital-product-reviews" element={<AdminDigitalProductReviews />} />
                            <Route path="portfolio-reviews" element={<AdminPortfolioReviews />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="finance/payouts" element={<AdminFinancePayoutLedger />} />
                            <Route path="finance" element={<AdminFinance />} />
                            <Route path="security" element={<AdminSecurity />} />
                            <Route path="audit-logs" element={<AdminAuditLogs />} />
                            <Route path="compliance" element={<AdminCompliance />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="contact-messages" element={<AdminContactMessages />} />
                            <Route path="bug-reports" element={<AdminBugReports />} />
                            <Route path="chat-logs" element={<AdminChatLogs />} />
                            <Route path="notify-subscribers" element={<AdminNotifySubscribers />} />
                            <Route path="website-reviews" element={<AdminWebsiteReviews />} />
                            <Route path="booking-reviews" element={<AdminBookingReviews />} />
                            <Route path="system" element={<AdminSystem />} />
                            <Route path="observability" element={<AdminObservability />} />
                            <Route path="ai" element={<AdminAi />} />
                            <Route path="*" element={<AdminDashboard />} />
                          </Routes>
                        </Suspense>
                      </AdminLayout>
                    </AdminRouteErrorBoundary>
                  </AdminThemeProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdminRoute && !isLoginPage && <Footer />}
      {isLoaded && !isAdminRoute && !isLoginPage && (
        <>
          <CookieConsent />
          <LaunchCountdown />
          <ScrollIndicator />
          <PublicFaqBot />
        </>
      )}
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/login';
  const shouldShowLoader = !isAdminRoute && !isLoginPage;

  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoaderComplete = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    if (!shouldShowLoader) {
      setIsLoaded(true);
    }
  }, [shouldShowLoader]);

  return (
    <>
      {shouldShowLoader && <PageLoader onComplete={handleLoaderComplete} />}
      <MainContent isLoaded={isLoaded} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
        <Router>
          <AppShell />
        </Router>
      </QueryProvider>
    </AuthProvider>
  );
}

export default App;
