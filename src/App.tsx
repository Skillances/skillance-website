import { useState, useEffect, useRef, lazy, Suspense, type ReactNode } from 'react';
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
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRouteErrorBoundary from './components/common/AdminRouteErrorBoundary';
import { sendClientLog } from './lib/clientLog';
import { AuthProvider } from './context/AuthContext';
import { AdminThemeProvider, useAdminTheme } from './context/AdminThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import CookieConsent from './components/layout/CookieConsent';
import ExperienceSwitcherDock from './components/experience/ExperienceSwitcherDock';
import { SITE_EXPERIENCE_PAPER, syncSiteChromeCss } from '@/lib/layout/siteChrome';
import { getLenisFromWindow, syncSectionScrollMarginCss } from './lib/sectionScroll';
import { getPrefersReducedMotion, LENIS_DURATION } from './lib/motion';
import RequireAuth from './components/marketplace/RequireAuth';
import { isMarketplacePath, isMarketplaceShellPath } from './lib/marketplace/routes';
import { isBeyondPath } from './lib/beyond/routes';
import { isMarketingAuthPath } from './lib/marketing/authPaths';

const HelpCenter = lazy(() => import('./pages/help/HelpCenter'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const CookiePolicy = lazy(() => import('./pages/legal/CookiePolicy'));
const PaiaManual = lazy(() => import('./pages/legal/PaiaManual'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));
const FAQPage = lazy(() => import('./pages/help/FAQPage'));
const TrustSafetyPage = lazy(() => import('./pages/help/TrustSafetyPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const MarketplaceLayout = lazy(() => import('./components/marketplace/MarketplaceLayout'));
const LaunchCountdown = lazy(() => import('./components/layout/LaunchCountdown'));
const ScrollIndicator = lazy(() => import('./components/layout/ScrollIndicator'));
const PublicFaqBot = lazy(() => import('./components/layout/PublicFaqBot'));

type LenisWindow = Window & { __lenis?: Lenis };

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
const AdminBeyondWork = lazy(() => import('./pages/admin/AdminBeyondWork'));
const AdminBookingReviews = lazy(() => import('./pages/admin/AdminBookingReviews'));
const AdminChatLogs = lazy(() => import('./pages/admin/AdminChatLogs'));
const AdminCompliance = lazy(() => import('./pages/admin/AdminCompliance'));
const AdminAi = lazy(() => import('./pages/admin/AdminAi'));
const AdminCategoryLimitRequests = lazy(() => import('./pages/admin/AdminCategoryLimitRequests'));
const AdminCertificationReviews = lazy(() => import('./pages/admin/AdminCertificationReviews'));
const AdminDigitalProductReviews = lazy(() => import('./pages/admin/AdminDigitalProductReviews'));
const AdminPortfolioReviews = lazy(() => import('./pages/admin/AdminPortfolioReviews'));

const RegisterPage = lazy(() => import('./pages/marketplace/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/marketplace/ForgotPasswordPage'));
const CustomerHomePage = lazy(() => import('./pages/marketplace/CustomerHomePage'));
const SearchPage = lazy(() => import('./pages/marketplace/SearchPage'));
const CategoryResultsPage = lazy(() => import('./pages/marketplace/CategoryResultsPage'));
const FreelancerProfilePage = lazy(() => import('./pages/marketplace/FreelancerProfilePage'));
const BookFreelancerPage = lazy(() => import('./pages/marketplace/BookFreelancerPage'));
const BookingsPage = lazy(() => import('./pages/marketplace/BookingsPage'));
const BookingDetailPage = lazy(() => import('./pages/marketplace/BookingDetailPage'));
const ChatListPage = lazy(() => import('./pages/marketplace/ChatListPage'));
const ChatThreadPage = lazy(() => import('./pages/marketplace/ChatThreadPage'));
const FreelancerDashboardPage = lazy(() => import('./pages/marketplace/FreelancerDashboardPage'));
const FreelancerJobsPage = lazy(() => import('./pages/marketplace/FreelancerJobsPage'));
const WorkProfilePage = lazy(() => import('./pages/marketplace/WorkProfilePage'));
const WorkLocationsPage = lazy(() => import('./pages/marketplace/WorkLocationsPage'));
const WorkAvailabilityPage = lazy(() => import('./pages/marketplace/WorkAvailabilityPage'));
const WorkPortfolioPage = lazy(() => import('./pages/marketplace/WorkPortfolioPage'));
const WorkCertificationsPage = lazy(() => import('./pages/marketplace/WorkCertificationsPage'));
const WorkVerificationPage = lazy(() => import('./pages/marketplace/WorkVerificationPage'));
const WorkPoliceClearancePage = lazy(() => import('./pages/marketplace/WorkPoliceClearancePage'));
const WorkProductsPage = lazy(() => import('./pages/marketplace/WorkProductsPage'));
const WorkEarningsPage = lazy(() => import('./pages/marketplace/WorkEarningsPage'));
const WorkInvoicesPage = lazy(() => import('./pages/marketplace/WorkInvoicesPage'));
const DocumentsPage = lazy(() => import('./pages/marketplace/DocumentsPage'));
const DocumentViewerPage = lazy(() => import('./pages/marketplace/DocumentViewerPage'));
const FavoritesPage = lazy(() => import('./pages/marketplace/FavoritesPage'));
const RecurringPage = lazy(() => import('./pages/marketplace/RecurringPage'));
const AccountPage = lazy(() => import('./pages/marketplace/AccountPage'));
const EditAccountPage = lazy(() => import('./pages/marketplace/EditAccountPage'));
const SettingsPage = lazy(() => import('./pages/marketplace/SettingsPage'));
const ApplyFreelancerPage = lazy(() => import('./pages/marketplace/ApplyFreelancerPage'));
const BugReportPage = lazy(() => import('./pages/marketplace/BugReportPage'));
const BeyondApp = lazy(() => import('./beyond/BeyondApp'));

function RouteShell({ beyond, children }: { beyond: boolean; children: ReactNode }) {
  if (beyond) return children;
  return <main className="relative z-0">{children}</main>;
}

function BeyondRouteFallback() {
  return (
    <div role="status" aria-live="polite" style={{ minHeight: '100dvh', background: '#F3EEE6' }}>
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        Loading Beyond the App
      </span>
    </div>
  );
}

gsap.registerPlugin(ScrollTrigger);

// Scroll to top component on route change — skips when a section scroll target is pending
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Don't scroll to top when navigating to a section anchor on home.
    if (hash.startsWith('#')) return;
    // Backward compatibility for legacy cross-route section jumps.
    if (sessionStorage.getItem('skillance_scroll_to')) return;
    const lenis = getLenisFromWindow();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
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
  const isAuthPath = isMarketingAuthPath(location.pathname);
  // Marketplace app shell: no marketing chrome, native scroll.
  const isMarketplaceRoute = isMarketplacePath(location.pathname);
  const isBeyondRoute = isBeyondPath(location.pathname);
  const hideMarketingChrome = isAdminRoute || isMarketplaceRoute || isBeyondRoute;
  const showMarketingNav = !hideMarketingChrome;
  const showMarketingFooter = showMarketingNav && !isAuthPath && !isBeyondRoute;
  const showMarketingWidgets = showMarketingFooter;
  const useLenisScroll = !isMarketplaceRoute && !isBeyondRoute;
  // One key for the whole shell so the layout stays mounted; it animates its own page enters.
  const isExperienceShell =
    location.pathname === '/' || isBeyondRoute;
  const routeAnimationKey = isAdminRoute
    ? '/admin'
    : isMarketplaceShellPath(location.pathname)
      ? '/marketplace'
      : isExperienceShell
        ? 'experience-shell'
        : location.pathname;

  /* Dock on marketplace only; Beyond keeps the switcher in its header center column. */
  const showExperienceSwitcherDock =
    showMarketingNav && !isBeyondRoute && !isAdminRoute && !isMarketplaceRoute && !isAuthPath;

  useEffect(() => {
    syncSiteChromeCss();
    window.addEventListener('resize', syncSiteChromeCss);
    return () => window.removeEventListener('resize', syncSiteChromeCss);
  }, [location.pathname, showMarketingNav, isBeyondRoute]);

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
    if (isLoaded && useLenisScroll) {
      // Initialize Lenis for smooth scrolling
      const reducedMotion = getPrefersReducedMotion();
      const lenis = new Lenis({
        duration: reducedMotion ? 0 : LENIS_DURATION,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        autoRaf: false,
        allowNestedScroll: true,
      });

      // Expose on window so Navigation can use lenis.scrollTo (avoids scrollIntoView conflict)
      (window as LenisWindow).__lenis = lenis;

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
        delete (window as LenisWindow).__lenis;
        lenis.destroy();
      };
    }
  }, [isLoaded, useLenisScroll]);

  return (
    <div 
      ref={mainRef} 
      className={`relative min-h-screen ${isAdminRoute ? 'bg-neutral-950' : ''} transition-opacity duration-[550ms] ease-[cubic-bezier(0.23,1,0.32,1)] will-change-[opacity] ${
        isLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={isAdminRoute ? undefined : { backgroundColor: SITE_EXPERIENCE_PAPER }}
    >
      <ScrollToTop />
      {showMarketingNav && <Navigation isLoaded={isLoaded} />}
      <ExperienceSwitcherDock enabled={showExperienceSwitcherDock} />
      <RouteShell beyond={isBeyondRoute}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={routeAnimationKey}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/help-center" element={<PageTransition routeKey="/help-center"><Suspense fallback={null}><HelpCenter /></Suspense></PageTransition>} />
            <Route path="/privacy-policy" element={<PageTransition routeKey="/privacy-policy"><Suspense fallback={null}><Privacy /></Suspense></PageTransition>} />
            <Route path="/privacy" element={<Navigate to="/privacy-policy" replace />} />
            <Route path="/terms" element={<PageTransition routeKey="/terms"><Suspense fallback={null}><Terms /></Suspense></PageTransition>} />
            <Route path="/refund-policy" element={<PageTransition routeKey="/refund-policy"><Suspense fallback={null}><RefundPolicy /></Suspense></PageTransition>} />
            <Route path="/cookie-policy" element={<PageTransition routeKey="/cookie-policy"><Suspense fallback={null}><CookiePolicy /></Suspense></PageTransition>} />
            <Route path="/paia-manual" element={<PageTransition routeKey="/paia-manual"><Suspense fallback={null}><PaiaManual /></Suspense></PageTransition>} />
            <Route path="/faq" element={<PageTransition routeKey="/faq"><Suspense fallback={null}><FAQPage /></Suspense></PageTransition>} />
            <Route path="/trust-safety" element={<PageTransition routeKey="/trust-safety"><Suspense fallback={null}><TrustSafetyPage /></Suspense></PageTransition>} />
            <Route path="/services" element={<PageTransition routeKey="/services"><Suspense fallback={null}><ServicesPage /></Suspense></PageTransition>} />
            <Route path="/contact" element={<PageTransition routeKey="/contact"><Suspense fallback={null}><ContactPage /></Suspense></PageTransition>} />
            <Route
              path="/beyond/*"
              element={
                <Suspense fallback={<BeyondRouteFallback />}>
                  <BeyondApp />
                </Suspense>
              }
            />
            <Route path="/category/:id" element={<PageTransition routeKey={location.pathname}><Suspense fallback={null}><CategoryPage /></Suspense></PageTransition>} />
            <Route path="/login" element={<PageTransition routeKey="/login"><Suspense fallback={null}><LoginPage /></Suspense></PageTransition>} />
            <Route path="/register" element={<Suspense fallback={null}><RegisterPage /></Suspense>} />
            <Route path="/forgot-password" element={<Suspense fallback={null}><ForgotPasswordPage /></Suspense>} />

            {/* Marketplace app shell. Public browse pages first, then signed-in pages. */}
            <Route element={<Suspense fallback={null}><MarketplaceLayout /></Suspense>}>
              <Route path="/home" element={<CustomerHomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/browse/category/:categoryId" element={<CategoryResultsPage />} />
              <Route path="/freelancers/:freelancerId" element={<FreelancerProfilePage />} />

              <Route path="/freelancers/:freelancerId/book" element={<RequireAuth><BookFreelancerPage /></RequireAuth>} />
              <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
              <Route path="/bookings/:bookingId" element={<RequireAuth><BookingDetailPage /></RequireAuth>} />
              <Route path="/chats" element={<RequireAuth><ChatListPage /></RequireAuth>} />
              <Route path="/chats/:chatId" element={<RequireAuth><ChatThreadPage /></RequireAuth>} />
              <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
              <Route path="/documents" element={<RequireAuth><DocumentsPage /></RequireAuth>} />
              <Route path="/documents/:productId" element={<RequireAuth><DocumentViewerPage /></RequireAuth>} />
              <Route path="/recurring" element={<RequireAuth><RecurringPage /></RequireAuth>} />
              <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
              <Route path="/account/edit" element={<RequireAuth><EditAccountPage /></RequireAuth>} />
              <Route path="/account/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
              <Route path="/account/apply-freelancer" element={<RequireAuth><ApplyFreelancerPage /></RequireAuth>} />
              <Route path="/account/bug-report" element={<RequireAuth><BugReportPage /></RequireAuth>} />
              <Route path="/account/*" element={<Navigate to="/account" replace />} />
              <Route path="/work" element={<RequireAuth><FreelancerDashboardPage /></RequireAuth>} />
              <Route path="/work/jobs" element={<RequireAuth><FreelancerJobsPage /></RequireAuth>} />
              <Route path="/work/profile" element={<RequireAuth><WorkProfilePage /></RequireAuth>} />
              <Route path="/work/locations" element={<RequireAuth><WorkLocationsPage /></RequireAuth>} />
              <Route path="/work/availability" element={<RequireAuth><WorkAvailabilityPage /></RequireAuth>} />
              <Route path="/work/portfolio" element={<RequireAuth><WorkPortfolioPage /></RequireAuth>} />
              <Route path="/work/certifications" element={<RequireAuth><WorkCertificationsPage /></RequireAuth>} />
              <Route path="/work/verification" element={<RequireAuth><WorkVerificationPage /></RequireAuth>} />
              <Route path="/work/police-clearance" element={<RequireAuth><WorkPoliceClearancePage /></RequireAuth>} />
              <Route path="/work/products" element={<RequireAuth><WorkProductsPage /></RequireAuth>} />
              <Route path="/work/earnings" element={<RequireAuth><WorkEarningsPage /></RequireAuth>} />
              <Route path="/work/invoices" element={<RequireAuth><WorkInvoicesPage /></RequireAuth>} />
              <Route path="/work/*" element={<Navigate to="/work" replace />} />
            </Route>

            {/* Admin Routes — no transition wrapper (has its own layout) */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminThemeProvider>
                    <AdminRouteErrorBoundary resetPath={location.pathname}>
                      <Suspense fallback={null}>
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
                            <Route path="beyond-work" element={<AdminBeyondWork />} />
                            <Route path="booking-reviews" element={<AdminBookingReviews />} />
                            <Route path="system" element={<AdminSystem />} />
                            <Route path="observability" element={<AdminObservability />} />
                            <Route path="ai" element={<AdminAi />} />
                            <Route path="*" element={<AdminDashboard />} />
                          </Routes>
                        </Suspense>
                      </AdminLayout>
                      </Suspense>
                    </AdminRouteErrorBoundary>
                  </AdminThemeProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </RouteShell>
      {showMarketingFooter && <Footer />}
      {isLoaded && showMarketingNav && !isAuthPath && !isBeyondRoute && (
        <Suspense fallback={null}>
          <LaunchCountdown />
        </Suspense>
      )}
      {isLoaded && showMarketingWidgets && (
        <>
          <CookieConsent />
          <Suspense fallback={null}>
            <ScrollIndicator />
            <PublicFaqBot />
          </Suspense>
        </>
      )}
    </div>
  );
}

function readInitialLoaded(shouldShowLoader: boolean): boolean {
  if (!shouldShowLoader) return true;
  try {
    return sessionStorage.getItem('skillance_loaded') === 'true';
  } catch {
    return false;
  }
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const shouldShowLoader =
    !isAdminRoute &&
    !isMarketingAuthPath(location.pathname) &&
    !isMarketplacePath(location.pathname);

  const [isLoaded, setIsLoaded] = useState(() => readInitialLoaded(shouldShowLoader));

  const handleLoaderComplete = () => {
    setIsLoaded(true);
  };

  const loaderSurface = SITE_EXPERIENCE_PAPER;

  useEffect(() => {
    if (!shouldShowLoader) return;
    if (isBeyondPath(location.pathname)) {
      void import('./beyond/BeyondApp');
    }
  }, [location.pathname, shouldShowLoader]);

  // Routes without the marketing loader are ready immediately (state adjusted during render).
  if (!shouldShowLoader && !isLoaded) {
    setIsLoaded(true);
  }

  return (
    <>
      {shouldShowLoader && (
        <PageLoader surfaceColor={loaderSurface} onComplete={handleLoaderComplete} />
      )}
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
