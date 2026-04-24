/**
 * Central API paths (leading slash), aligned with the Skillance Backend Fastify routes.
 * Use with get/post/put/del from @/lib/api so renames stay in one place.
 */

export const ApiPaths = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  users: {
    me: '/users/me',
  },

  categories: {
    list: '/categories',
    featured: '/categories/featured',
  },

  public: {
    contact: '/public/contact',
    notify: '/public/notify',
    reviews: '/public/reviews',
    testimonials: '/public/testimonials',
    cookieConsent: '/public/cookie-consent',
    stats: '/public/stats',
  },

  admin: {
    dashboard: '/admin/dashboard',

    eventsVerificationStream: '/admin/events/verification-stream',

    metricsSnapshot: '/admin/metrics/snapshot',
    metricsHistory: '/admin/metrics/history',
    queryMetrics: '/admin/query-metrics',
    observabilityErrors: '/admin/observability/errors',

    chats: '/admin/chats',
    bookingChat: (bookingId: string) => `/admin/bookings/${bookingId}/chat`,

    freelancersPendingVerification: '/admin/freelancers/pending-verification',
    freelancers: '/admin/freelancers',
    freelancersStats: '/admin/freelancers/stats',
    freelancer: (id: string) => `/admin/freelancers/${id}`,
    freelancerBookings: (id: string) => `/admin/freelancers/${id}/bookings`,
    freelancerVerifyId: (id: string) => `/admin/freelancers/${id}/verify-id`,

    freelancerCategoryLimitRequests: '/admin/freelancer-category-limit-requests',
    freelancerCategoryLimitRequestApprove: (requestId: string) =>
      `/admin/freelancer-category-limit-requests/${requestId}/approve`,
    freelancerCategoryLimitRequestDeny: (requestId: string) =>
      `/admin/freelancer-category-limit-requests/${requestId}/deny`,

    freelancerCertificationsPending: '/admin/freelancer-certifications/pending',
    freelancerCertificationVerify: (certificationId: string) =>
      `/admin/freelancer-certifications/${certificationId}/verify`,
    freelancerPoliceClearanceVerify: (id: string) =>
      `/admin/freelancers/${id}/police-clearance/verify`,
    freelancerPhoto: (freelancerId: string, photoType: string) =>
      `/admin/freelancers/${freelancerId}/photos/${photoType}`,

    users: '/admin/users',
    usersStats: '/admin/users/stats',
    user: (id: string) => `/admin/users/${id}`,

    customers: '/admin/customers',
    customer: (id: string) => `/admin/customers/${id}`,
    customerBookings: (id: string) => `/admin/customers/${id}/bookings`,

    bookings: '/admin/bookings',
    bookingsStats: '/admin/bookings/stats',

    roleApplications: '/admin/role-applications',
    roleApplicationApprove: (id: string) => `/admin/role-applications/${id}/approve`,
    roleApplicationReject: (id: string) => `/admin/role-applications/${id}/reject`,

    financeSummary: '/admin/finance/summary',
    financeTimeseries: '/admin/finance/timeseries',

    securityEvents: '/admin/security/events',
    securityStatistics: '/admin/security/statistics',
    securityByCountry: '/admin/security/by-country',
    securityBlockedIps: '/admin/security/blocked-ips',
    securityIp: (ip: string) => `/admin/security/ip/${encodeURIComponent(ip)}`,
    securityBlockIp: '/admin/security/block-ip',
    securityUnblockIp: '/admin/security/unblock-ip',

    auditLogs: '/admin/audit-logs',
    auditLogsStats: '/admin/audit-logs/stats',

    complianceCookieConsent: '/admin/compliance/cookie-consent',
    complianceTermsAcceptance: '/admin/compliance/terms-acceptance',

    maintenanceTasks: '/admin/maintenance/tasks',
    maintenanceRun: (taskId: string) =>
      `/admin/maintenance/run/${encodeURIComponent(taskId)}`,

    categories: '/admin/categories',
    categoriesStats: '/admin/categories/stats',
    category: (id: string) => `/admin/categories/${id}`,

    analyticsUserGrowth: '/admin/analytics/user-growth',
    analyticsFreelancerGrowth: '/admin/analytics/freelancer-growth',
    analyticsCategoryTrends: '/admin/analytics/category-trends',
    analyticsVerificationTrends: '/admin/analytics/verification-trends',
    analyticsUserDistribution: '/admin/analytics/user-distribution',

    contactMessages: '/admin/contact-messages',
    contactMessage: (id: string) => `/admin/contact-messages/${id}`,

    notifySubscribers: '/admin/notify-subscribers',
    notifySubscribersExport: '/admin/notify-subscribers/export',
    notifySubscriber: (id: string) => `/admin/notify-subscribers/${id}`,

    websiteReviews: '/admin/website-reviews',
    websiteReview: (id: string) => `/admin/website-reviews/${id}`,

    bookingReviews: '/admin/booking-reviews',
    bookingReviewHide: (id: string) => `/admin/booking-reviews/${id}/hide`,
    bookingReviewRestore: (id: string) => `/admin/booking-reviews/${id}/restore`,

    aiConfig: '/admin/ai/config',
    aiChat: '/admin/ai/chat',
  },
} as const;
