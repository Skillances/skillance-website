/**
 * Central API paths (leading slash), aligned with the Skillance Backend Fastify routes.
 * Use with get/post/put/del from @/lib/api so renames stay in one place.
 */

export const ApiPaths = {
  /** Public health check (no auth). */
  health: '/health',

  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  /** Backend POST /ably/auth issues subscribe-only TokenRequests (includes admin queue when DB isAdmin). */
  realtime: {
    ablyAuth: '/ably/auth',
  },

  users: {
    me: '/users/me',
  },

  categories: {
    list: '/categories',
    featured: '/categories/featured',
  },

  public: {
    /** GET: proxy Lottie JSON from public category-images S3 prefix (allowlisted); no auth. */
    categoryLottie: '/public/category-lottie',
    contact: '/public/contact',
    notify: '/public/notify',
    reviews: '/public/reviews',
    testimonials: '/public/testimonials',
    cookieConsent: '/public/cookie-consent',
    stats: '/public/stats',
    bugReport: '/public/bug-report',
  },

  admin: {
    dashboard: '/admin/dashboard',

    /** Scalar OpenAPI UI; requires admin JWT (Bearer or API-host cookie). Not a website SPA route. */
    apiDocsScalar: '/admin/api-docs',

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
    digitalProductsPending: '/admin/digital-products/pending',
    digitalProductVerify: (productId: string) => `/admin/digital-products/${productId}/verify`,
    portfolioProjectsPending: '/admin/portfolio-projects/pending',
    portfolioProjectVerify: (projectId: string) =>
      `/admin/portfolio-projects/${projectId}/verify`,
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
    booking: (id: string) => `/admin/bookings/${id}`,
    bookingsStats: '/admin/bookings/stats',
    bookingDevToolsStatus: '/admin/dev/booking-tools-status',
    bookingAdvanceSessionDev: (bookingId: string) =>
      `/admin/bookings/${bookingId}/dev/advance-session`,
    bookingAdvanceCompletedDev: (bookingId: string) =>
      `/admin/bookings/${bookingId}/dev/advance-completed`,

    roleApplications: '/admin/role-applications',
    roleApplicationApprove: (id: string) => `/admin/role-applications/${id}/approve`,
    roleApplicationReject: (id: string) => `/admin/role-applications/${id}/reject`,

    financeSummary: '/admin/finance/summary',
    financeTimeseries: '/admin/finance/timeseries',
    financePayoutLedger: '/admin/finance/payout-ledger',

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

    appClientStatus: '/admin/app-client-status',

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

    bugReports: '/admin/bug-reports',
    bugReport: (id: string) => `/admin/bug-reports/${id}`,

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
  /** Customer and freelancer marketplace (website app shell). */
  marketplace: {
    registerCustomer: '/auth/register/customer',
    registerFreelancer: '/auth/register/freelancer',
    forgotPassword: '/auth/forgot-password',
    google: '/auth/google',
    preferredView: '/users/me/preferred-view',
    roleApplications: '/users/me/role-applications',
    syncCustomerProfile: '/users/me/sync-customer-profile',
    deleteAccount: '/users/me/delete-account',
    exportAccount: '/users/me/export',
    user: (userId: string) => `/users/${userId}`,
    userSettings: (userId: string) => `/users/${userId}/settings`,
    acknowledgePolicyWarning: (warningId: string) =>
      `/users/me/policy-warnings/${warningId}/acknowledge`,

    freelancers: '/freelancers',
    searchFreelancers: '/freelancers/search',
    applyFreelancer: '/freelancers/apply',
    freelancerApplicationStatus: '/freelancers/application-status',
    myProfileCompletion: '/freelancers/profile-completion/me',
    freelancer: (id: string) => `/freelancers/${id}`,
    freelancerByUser: (userId: string) => `/freelancers/user/${userId}`,
    freelancerIdVerification: (userId: string) =>
      `/freelancers/user/${userId}/id-verification`,
    freelancerCertificationsHub: (userId: string) =>
      `/freelancers/user/${userId}/certifications-hub`,
    freelancerPoliceClearance: (userId: string) =>
      `/freelancers/user/${userId}/police-clearance`,
    freelancerAvailabilityContext: (userId: string) =>
      `/freelancers/user/${userId}/availability-context`,
    freelancerProfileCompletion: (id: string) => `/freelancers/${id}/profile-completion`,
    freelancerCategoryLimitRequests: (id: string) =>
      `/freelancers/${id}/category-limit-requests`,
    freelancerBookings: (id: string) => `/freelancers/${id}/bookings`,
    freelancerAvailability: (id: string) => `/freelancers/${id}/availability`,
    freelancerAvailabilityValidate: (id: string) =>
      `/freelancers/${id}/availability/validate`,
    freelancerPortfolio: (id: string) => `/freelancers/${id}/portfolio`,
    freelancerPortfolioProject: (id: string, projectId: string) =>
      `/freelancers/${id}/portfolio/${projectId}`,
    freelancerServiceLocations: (id: string) => `/freelancers/${id}/service-locations`,
    freelancerServiceLocation: (id: string, locationId: string) =>
      `/freelancers/${id}/service-locations/${locationId}`,
    freelancerPoliceClearanceUpload: (id: string) =>
      `/freelancers/${id}/police-clearance`,
    freelancerCertifications: (id: string) => `/freelancers/${id}/certifications`,
    freelancerCertification: (id: string, certificationId: string) =>
      `/freelancers/${id}/certifications/${certificationId}`,
    freelancerDashboardStats: (id: string) => `/freelancers/${id}/dashboard/stats`,
    freelancerEarningsTrend: (id: string) =>
      `/freelancers/${id}/dashboard/earnings-trend`,
    freelancerDashboardPerformance: (id: string) =>
      `/freelancers/${id}/dashboard/performance`,
    freelancerDashboardActivity: (id: string) =>
      `/freelancers/${id}/dashboard/activity`,
    freelancerReviews: (id: string) => `/freelancers/${id}/reviews`,
    customerRating: (userId: string) => `/users/${userId}/customer-rating`,

    bookings: '/bookings',
    myBookings: '/bookings/my',
    booking: (id: string) => `/bookings/${id}`,
    bookingAccept: (id: string) => `/bookings/${id}/accept`,
    bookingDecline: (id: string) => `/bookings/${id}/decline`,
    bookingDismiss: (id: string) => `/bookings/${id}/dismiss`,
    bookingCancel: (id: string) => `/bookings/${id}/cancel`,
    bookingSessionStatus: (id: string) => `/bookings/${id}/session-status`,
    bookingLocation: (id: string) => `/bookings/${id}/location`,
    bookingConnectionFee: (id: string) => `/bookings/${id}/connection-fee`,
    bookingConnectionFeeConfirm: (id: string) =>
      `/bookings/${id}/connection-fee/confirm`,
    bookingPin: (id: string) => `/bookings/${id}/pin`,
    bookingVerifyPin: (id: string) => `/bookings/${id}/verify-pin`,
    bookingRateFreelancer: (id: string) => `/bookings/${id}/rate-freelancer`,
    bookingReviewText: (id: string) => `/bookings/${id}/review-text`,
    bookingRateCustomer: (id: string) => `/bookings/${id}/rate-customer`,
    bookingFeedbackStatus: (id: string) => `/bookings/${id}/feedback-status`,

    invoices: '/invoices',
    invoiceSend: (invoiceId: string) => `/invoices/${invoiceId}/send`,
    invoiceAccept: (invoiceId: string) => `/invoices/${invoiceId}/accept`,
    invoiceDecline: (invoiceId: string) => `/invoices/${invoiceId}/decline`,
    invoiceByBooking: (bookingId: string) => `/invoices/booking/${bookingId}`,

    disputes: '/disputes',
    disputeByBooking: (bookingId: string) => `/disputes/booking/${bookingId}`,

    favorites: '/favorites',
    favoriteStatus: (freelancerId: string) => `/favorites/${freelancerId}/status`,
    favoriteStatusBatch: '/favorites/status',
    favoriteRemove: (freelancerId: string) => `/favorites/${freelancerId}`,

    chats: '/chats',
    chatByBooking: (bookingId: string) => `/chats/booking/${bookingId}`,
    chatMessages: (chatId: string) => `/chats/${chatId}/messages`,
    chatRead: (chatId: string) => `/chats/${chatId}/read`,

    recurringRequests: '/recurring-bookings/requests',
    recurringRequestAccept: (id: string) => `/recurring-bookings/requests/${id}/accept`,
    recurringRequestReject: (id: string) => `/recurring-bookings/requests/${id}/reject`,
    recurringPending: '/recurring-bookings/requests/pending',
    recurringSeries: '/recurring-bookings/series',
    recurringSeriesById: (id: string) => `/recurring-bookings/series/${id}`,
    recurringSeriesPause: (id: string) => `/recurring-bookings/series/${id}/pause`,
    recurringSeriesResume: (id: string) => `/recurring-bookings/series/${id}/resume`,
    recurringSeriesCancel: (id: string) => `/recurring-bookings/series/${id}/cancel`,

    products: '/products',
    myProducts: '/products/mine',
    purchasedProducts: '/products/purchased',
    freelancerProducts: (freelancerId: string) => `/products/freelancer/${freelancerId}`,
    product: (productId: string) => `/products/${productId}`,
    productPurchase: (productId: string) => `/products/${productId}/purchase`,
    productView: (productId: string) => `/products/${productId}/view`,

    calendarSyncExport: '/calendar-sync/export',
    geocode: '/geocoding/geocode',
    reverseGeocode: '/geocoding/reverse',
    placeAutocomplete: '/geocoding/places/autocomplete',
  },
} as const;
