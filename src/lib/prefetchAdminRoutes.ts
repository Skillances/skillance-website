/**
 * Starts loading admin route chunks in the background once the shell is mounted.
 * Each navigation stays code-split (small initial bundles for public routes);
 * prefetch makes subsequent clicks hit the cached module instead of cold loads.
 */

export function prefetchAdminRouteChunks(): void {
  const runners = [
    import('@/pages/admin/AdminDashboard'),
    import('@/pages/admin/AdminUsers'),
    import('@/pages/admin/AdminRoleApplications'),
    import('@/pages/admin/AdminUserDetail'),
    import('@/pages/admin/AdminFreelancers'),
    import('@/pages/admin/AdminFreelancerDetail'),
    import('@/pages/admin/AdminCustomers'),
    import('@/pages/admin/AdminBookings'),
    import('@/pages/admin/AdminBookingDetail'),
    import('@/pages/admin/AdminCustomerDetail'),
    import('@/pages/admin/AdminVerifications'),
    import('@/pages/admin/AdminAnalytics'),
    import('@/pages/admin/AdminFinance'),
    import('@/pages/admin/AdminFinancePayoutLedger'),
    import('@/pages/admin/AdminSecurity'),
    import('@/pages/admin/AdminAuditLogs'),
    import('@/pages/admin/AdminCategories'),
    import('@/pages/admin/AdminSystem'),
    import('@/pages/admin/AdminObservability'),
    import('@/pages/admin/AdminContactMessages'),
    import('@/pages/admin/AdminBugReports'),
    import('@/pages/admin/AdminNotifySubscribers'),
    import('@/pages/admin/AdminWebsiteReviews'),
    import('@/pages/admin/AdminBookingReviews'),
    import('@/pages/admin/AdminChatLogs'),
    import('@/pages/admin/AdminCompliance'),
    import('@/pages/admin/AdminAi'),
    import('@/pages/admin/AdminCategoryLimitRequests'),
    import('@/pages/admin/AdminCertificationReviews'),
    import('@/pages/admin/AdminDigitalProductReviews'),
    import('@/pages/admin/AdminPortfolioReviews'),
  ];
  for (const p of runners) {
    void p.catch(() => {});
  }
}
